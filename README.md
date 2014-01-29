# AjaxTableRails

AjaxTableRails is a super simple, super lightweight library if all you want is fast, JSON-loaded tables with ajax sorting and pagination. It provides just enough to get you going and doesn't do anything fancy. It is also still very much in early development, so there are probably bugs.

## Usage

### Dependencies

Rails and JQuery. C'est ca. If you want to use the Javascript without Rails, feel free.

### Install ajax_table_rails gem

Add `ajax_table_rails` to your `Gemfile` and run `bundle install`

````
gem 'ajax_table_rails'
````

### Include javascript assets

Add the following to your `app/assets/javascripts/application.js`:

````
//= require ajaxtable
````

### Basic usage

#### Build your table

In your view (using Users as an example):

````
<table class="ajax-table" data-source="<%= users_path(format: :json)%>" id="users-table">
  <thead>
    <tr>
      <th data-sort-column="name">Name</th>
      <th data-sort-column="email">Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tfoot>
    <td colspan="3">&nbsp;</td>
  </tfoot>
  <tbody>
  </tbody>
</table>
````

In this example, the table will automatically initialize, and the Name and Email columns will be sortable. Record count and pagination will be inserted into the `tfoot`.

**Required attributes**

| Attribute | Description |
| --------- | ----------- |
| table data-source | JSON path for your table data |

**Optional attributes**

| Attribute | Description |
| --------- | ----------- |
| table class | "ajax-table" required for ajax tables to auto-init. Exclude this if you wish to init manually with custom settings (see below). |
| th data-sort-column | Matches database column you'd like to sort against. |

#### Build your controller

Call `set_ajax_table` in a `before_action` to set your sorting criteria, then setup the query in a JSON response block.

`set_ajax_table` populates `@order` and `@page`, which you can use directly in your query. I use Kaminari for pagination, but you can use whatever you like.

````
before_action -> {
  set_ajax_table(columns: %w[name email], default_column: "name", default_direction: "desc")
}, only: [:index]

def index
  respond_to do |format|
    format.html {}
    format.json {
      @users = User.order(@order).page(@page)
    }
  end
end
````

**Optional attributes**

| Attribute | Description |
| --------- | ----------- |
| columns | Whitelist of sortable columns |
| default_column | Your default sort column (if unspecified, defaults to `id`) |
| default_direction | Your default sort direction (if unspecified, deaults to `asc`) |

#### Build your JSON

You need to render two JSON nodes: `rows` for your records, and `pagination` for your pagination details.

````
json.rows(@users) do |user|
  json.extract!(user, :name, :email)
  json.action link_to("Edit", edit_user_path(user), class: "btn")
end
json.pagination do
  json.per_page User.default_per_page
  json.count @users.size
  json.total_count User.count
end
````

### Advanced usage

#### Filtering results

**Under construction.** Adding the following anywhere on your page will currently work.

````
<form class="ajax-table-search" data-ajax-table-id="users-table">
  <input class="ajax-table-search-input">
  <a href="#" class="ajax-table-reset">x</a>
  <input type="submit" value="Search">
</form>
````

#### Customize your table

AjaxTableRails is built with Bootstrap and FontAwesome in mind, as well as some other defaults that may make you unhappy. You may want to override the classes used for pagination and sorting, as well as some other bits and bops. Here's what a full customization looks like (default values shown):

````
$(function() {
  ajaxTable.init($('#some-table'), {
    cssClasses: {
      count: 'at-count',          // "Showing xx records out of xx" span
      pagination: 'pagination',   // Pagination ul, defaults to match Bootstrap
      sort: 'at-sort',            // Sort icon base class
      sortAsc: 'fa fa-sort-up',   // Sort icon ascending indicator, defaults to use FontAwesome
      sortDesc: 'fa fa-sort-down' // Sort icon descending indicator, defaults to use FontAwesome
    },
    text: {
      count: 'Showing {count} records out of {total_count}', // Pass null to skip rendering of this element
      nextPage: '&raquo;',
      previousPage: '&laquo;'
    }
  });
});
````

#### Make it shiny

Use whatever CSS you like. Here's a rudimentary example of some things you may want to do.

````
th[data-sort-column] {
	cursor: pointer;
}
i.at-sort {
  margin-left: 5px;
}
span.at-count {
  float: left;
  margin-top: 10px;
}
ul.pagination {
  float: right;
}
````

## Love it? Hate it?

@uberllama

I also write random [tech articles](http://blog.littleblimp.com).

## Copyright

Copyright &copy; 2014 Yuval Kordov. See MIT-LICENSE for further details.

## TODO

* Result filtering
* Windowed pagination
* Show default sort
* Allow customization via data attributes