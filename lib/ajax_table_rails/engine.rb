module AjaxTableRails
  class Engine < ::Rails::Engine
    initializer "ajax_table_rails.load_before_actions" do
      ActiveSupport.on_load(:action_controller) do
        ActionController::Base.send(:include, AjaxTableActions)
      end
    end
  end
end
