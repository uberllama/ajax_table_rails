;(function ($, window, document, undefined) {

  // Load and build table and pagination based on current data state
  var loadTable = function($table) {
    params = {};
    params[$table.data('ajaxTable').params.page] = $table.data('page');
    params[$table.data('ajaxTable').params.sortColumn] = $table.data('sort-column');
    params[$table.data('ajaxTable').params.sortDirection] = $table.data('sort-direction');
    params[$table.data('ajaxTable').params.search] = $table.data('search');
    
    var request = $.ajax({
      url: $table.data('source'),
      data: $.extend({ format: 'json' }, params),
      type: 'GET',
      dataType: 'json'
    });
    request.done(function(data) {
      buildRows($table, data.rows);
      buildPagination($table, data.pagination);
    });
  };

  // Build table rows
  var buildRows = function($table, rows) {
    var $tbody = $table.find('tbody');
    $tbody.children().remove();
    $.each(rows, function(i,row) {
      var $tr = $('<tr/>');
      $tbody.append($tr);
      $.each(row, function(k,v) {
        $tr.append('<td>' + v + '</td>');
      });
    });
  };

  // Build counts and simple pagination
  var buildPagination = function($table, pagination) {
    $td = $table.find('tfoot').find('td').first();
    $td.children().remove();
    if (pagination.total_count > pagination.count) {
      // Display current out of total record count
      if ($table.data('ajaxTable').text.count) {
        var $count = $('<span/>', { class: $table.data('ajaxTable').cssClasses.count });
        $td.append($count);
        $count.html($table.data('ajaxTable').text.count.replace('{count}', pagination.count).replace('{total_count}', pagination.total_count));
      }
      // Build pagination controls
      var pageCount = Math.ceil(pagination.total_count / pagination.per_page);
      var currentPage = $table.data('page');
      var $ul = $('<ul/>', { class: $table.data('ajaxTable').cssClasses.pagination });
      $td.append($ul);
      if (currentPage > 1) {
        var previousPage = currentPage-1;
        $ul.append('<li><a href="#" data-page=' + previousPage + '>' + $table.data('ajaxTable').text.previousPage + '</a></li>');
      }
      for (var pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        var li = '<li';
        if (pageNumber == currentPage || (pageNumber == 1 && !currentPage)) li += ' class="active"';
        li += '>';
        $ul.append(li + '<a href="#" data-page=' + pageNumber + '>' + pageNumber + '</a></li>');
      }
      if (currentPage < pageCount) {
        var nextPage = currentPage+1;
        $ul.append('<li><a href="#" data-page=' + nextPage + '>' + $table.data('ajaxTable').text.nextPage + '</a></li>');
      }
      // Bind pagination controls
      $table.find('ul.' + $table.data('ajaxTable').cssClasses.pagination.split(' ').join('.') + ' a').on('click', function(e) {
        $table.data('page', $(this).data('page'));
        loadTable($table);
        e.preventDefault();
      });
    }
  };

  // Bind table headers to sort with direction
  // @note To enable sorting on a header, add a `data-sort-column` attribute with the desired column name.
  // @example `<th data-sort-column="email">Email</th>`
  var initSorting = function($table) {
    $table.find('th[data-sort-column]').on('click', function() {
      // Reset pagination
      $table.data('page', 1);
      // Set direction based on prior and just-clicked sort column
      var sortColumn = $(this).data('sort-column');
      var direction = ($table.data('sort-column') == sortColumn && $table.data('sort-direction') == 'asc') ? 'desc' : 'asc';
      $table.data('sort-direction', direction);
      // Set new sort column
      $table.data('sort-column', sortColumn);
      // Remove and re-insert sort icon
      $table.find('th i.' + $table.data('ajaxTable').cssClasses.sort).remove();
      var $i = $('<i/>', { class: $table.data('ajaxTable').cssClasses.sort + ' ' + (direction == 'asc' ? $table.data('ajaxTable').cssClasses.sortAsc : $table.data('ajaxTable').cssClasses.sortDesc) });
      $(this).append($i);
      // Reload table
      loadTable($table);
    });
  };

  // Initialize search and reset based off of searchForm specified on init
  var initSearch = function($table, searchForm) {
    $('body').on('submit', searchForm, function(e) {
      searchTable($table, $(this).find('input.ajax-table-search-input').val());
      e.preventDefault();
    });
    
    $('body').on('click', '.ajax-table-reset', function(e) {
      $(this).closest('form').find('input.ajax-table-search-input').val('');
      resetTable($table);
      e.preventDefault();
    });
  };

  // Filter table records against submitted keywords
  var searchTable = function($table, val) {
    $table.data('page', 1);
    $table.data('search', val);
    loadTable($table);
  };

  // Reset table to an unpaginated and unfiltered state
  var resetTable = function($table) {
    $table.data('page', 1);
    $table.removeData('search');
    loadTable($table);
  };

  var publicMethods = {

    init: function(options) {
      return this.each(function() {
        var $this = $(this);
        var defaults = {
          // You can safely use multiple classes here
          // @example `pagination: 'pagination foo-pagination'`
          cssClasses: {
            count:          'at-count',       // "Showing xx records out of xx" span
            pagination:     'pagination',     // Pagination ul, defaults to match Bootstrap
            sort:           'at-sort',        // Sort icon base class
            sortAsc:        'fa fa-sort-up',  // Sort icon ascending indicator, defaults to use FontAwesome
            sortDesc:       'fa fa-sort-down' // Sort icon descending indicator, defaults to use FontAwesome
          },
          // @note Querystring param keys match up with those used by ajax_table.rb
          params: {
            page:           'page',
            search:         'search',
            sortColumn:     'sort',
            sortDirection:  'direction'
          },
          searchForm:       null, // Form selector to be automatically bound for searching this table
          text: {
            count:          'Showing {count} records out of {total_count}', // To not display count, pass `text.count: null`
            nextPage:       '&raquo;',
            previousPage:   '&laquo;'
          }
        }
 
        var settings = $.extend(true, defaults, options);
        $this.data('ajaxTable', settings);
        loadTable($this);
        initSorting($this);
        if (settings.searchForm) {
          initSearch($this, settings.searchForm);
        }
      });
    },

    search: function(val) {
      var $this = $(this);
      searchTable($this, val);
      return $this;
    },

    reset: function() {
      var $this = $(this);
      resetTable($this);
      return $this;
    }

  };

  $.fn.ajaxTable = function(method) {
    if (publicMethods[method]) {
      return publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof(method) === 'object' || !method) {
      return publicMethods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.ajaxTable.');
    }
  };

})(jQuery, window, document);