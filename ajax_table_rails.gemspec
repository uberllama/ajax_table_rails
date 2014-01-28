$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "ajax_table_rails/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "ajax_table_rails"
  s.version     = AjaxTableRails::VERSION
  s.authors     = ["Yuval Kordov"]
  s.email       = ["yuval.kordov@gmail.com"]
  s.homepage    = "https://github.com/uberllama/ajax_table_rails"
  s.summary     = "Simple JSON-loaded tables with sorting and pagination"
  s.description = "An ultra lightweight alternative to datatables or dynatables, with built in Rails helpers. Still under construction [insert animated construction worker here]."
  s.license     = "MIT"

  s.files = `git ls-files`.split("\n")
  s.test_files = `git ls-files -- {test,spec,features}/*`.split("\n")

  s.add_dependency "rails", ">= 3.1"
end
