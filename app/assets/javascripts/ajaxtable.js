var ajaxTable = (function($) {

  // On document ready:
  // ajaxify all tables with the `ajax-table` class
  // bind search/reset via forms with the `ajax-table-search` class
  //
  // If you want to use custom settings for your tables, forego the `ajax-table` class and call init manually:
  // $(function() {
  //   ajaxTable.init($('#some-table'), {
  //     cssClasses: { pagination: 'some-class' },
  //     text: { count: null },
  //     ...
  //   });
  // });
  //
  // @see config Available settings
  $(function() {
    $('table.ajax-table').each(function() {
      init($(this));
    });

    $('body').on('submit', 'form.ajax-table-search', function(e) {
      var $form = $(this);
      search($('#'+$form.data('ajax-table-id')), $form.find('input.ajax-table-search-input').val());
      e.preventDefault();
    });

    $('body').on('click', '.ajax-table-reset', function(e) {
      var $form = $(this).closest('form.ajax-table-search');
      $form.find('input.ajax-table-search-input').val('');
      resetTable($('#'+$form.data('ajax-table-id')));
      e.preventDefault();
    });
  });
  
  /* public */

  // Load and build initial table, and bind static events
  var init = function($table, options) {
    $.extend(true, config, options);
    $table.data('page', 1);
    loadTable($table);
    initSorting($table);
  };

  // Filter table records against submitted keywords
  var search = function($table, val) {
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
  
  /* private */

  // Default config
  // All of these settings can be overriden by manually calling `init`
  var config = {
    // You can safely use multiple classes here
    // @example `pagination: 'pagination foo-pagination'`
    cssClasses: {
      count: 'at-count',          // "Showing xx records out of xx" span
      pagination: 'pagination',   // Pagination ul, defaults to match Bootstrap
      sort: 'at-sort',            // Sort icon base class
      sortAsc: 'fa fa-sort-up',   // Sort icon ascending indicator, defaults to use FontAwesome
      sortDesc: 'fa fa-sort-down' // Sort icon descending indicator, defaults to use FontAwesome
    },
    // @note Querystring param keys match up with those used by ajax_table.rb
    params: {
      page: 'page',
      search: 'search',
      sortColumn: 'sort',
      sortDirection: 'direction'
    },
    // To not display count, pass `text.count: null`
    text: {
      count: 'Showing {count} records out of {total_count}',
      nextPage: '&raquo;',
      previousPage: '&laquo;'
    }
  };

  // Load and render table, based on current page, sort, and search filter
  var loadTable = function($table) {
    params = {};
    params[config.params.page]          = $table.data('page');
    params[config.params.sortColumn]    = $table.data('sort-column');
    params[config.params.sortDirection] = $table.data('sort-direction');
    params[config.params.search]        = $table.data('search');
    
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
      $table.find('th i.' + config.cssClasses.sort).remove();
      var $i = $('<i/>', { class: config.cssClasses.sort + ' ' + (direction == 'asc' ? config.cssClasses.sortAsc : config.cssClasses.sortDesc) });
      $(this).append($i);
      // Reload table
      loadTable($table);
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
      if (config.text.count) {
        var $count = $('<span/>', { class: config.cssClasses.count });
        $td.append($count);
        $count.html(config.text.count.replace('{count}', pagination.count).replace('{total_count}', pagination.total_count));
      }
      // Build pagination controls
      var pageCount = Math.ceil(pagination.total_count / pagination.per_page);
      var currentPage = $table.data('page');
      var $ul = $('<ul/>', { class: config.cssClasses.pagination });
      $td.append($ul);
      if (currentPage > 1) {
        var previousPage = currentPage-1;
        $ul.append('<li><a href="#" data-page=' + previousPage + '>' + config.text.previousPage + '</a></li>');
      }
      for (var pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        var li = '<li';
        if (pageNumber == currentPage) li += ' class="active"';
        li += '>';
        $ul.append(li + '<a href="#" data-page=' + pageNumber + '>' + pageNumber + '</a></li>');
      }
      if (currentPage < pageCount) {
        var nextPage = currentPage+1;
        $ul.append('<li><a href="#" data-page=' + nextPage + '>' + config.text.nextPage + '</a></li>');
      }
      // Bind pagination controls
      $table.find('ul.' + config.cssClasses.pagination.split(' ').join('.') + ' a').on('click', function(e) {
        $table.data('page', $(this).data('page'));
        loadTable($table);
        e.preventDefault();
      });
    }
  };

  return {
    init: init,
    search: search,
    resetTable: resetTable
  }

})(jQuery);