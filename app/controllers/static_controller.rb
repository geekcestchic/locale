class StaticController < ApplicationController
  def index
  end
  def get_property_prices
    area = params[:data][:area] #we get this data from the post request in our javascript file
    @zoopla = HTTParty.get("http://api.zoopla.co.uk/api/v1/property_listings.json?area=#{area}&api_key=fvxw63sxhxakwt9z3h95cyxn")
    render json: @zoopla
  end
end
