module AjaxTableActions
  extend ActiveSupport::Concern

  private

  # before_action that sets @search, @page and @order instance variables based off ajax_table params `search`, sort` and `direction`
  #
  # @example With sortable columns
  #   before_action -> { set_ajax_table(columns: %w[name email], default_column: "name", default_direction: "asc") }
  #
  # @example With no sortable columns
  #   before_action -> { set_ajax_table(default_column: "name", default_direction: "asc") }
  #
  # @param [Hash] options                         Optional configuration. If none specified, sort params are ignored and the collection is sorted by ID
  # @option options [Array] columns               Whitelisted columns that can be sorted on
  # @option options [String] default_column       Default sort column
  # @option options [String] default_direction    Default sort direction
  def set_ajax_table(options = {})
    unless options.empty?
      column = (options[:columns] && options[:columns].detect {|column| column == params[:sort]}) || options[:default_column]
      direction = %w[asc desc].include?(params[:direction]) ? params[:direction] : options[:default_direction]
    end
    column ||= 'id'
    direction ||= 'asc'
    @order = "#{column} #{direction}"
    @page = [params[:page].to_i, 1].max
    @search = params[:search]
  end

end