define(function(require){

    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Origin = require('coreJS/app/origin');
    var OriginView = require('coreJS/app/views/originView');
    var AssetItemView = require('coreJS/assetManagement/views/assetManagementItemView');
    var AssetCollection = require('coreJS/assetManagement/collections/assetCollection');
    var AssetModel = require('coreJS/assetManagement/models/assetModel');
    var AssetManagementPreview = require('coreJS/assetManagement/views/assetManagementPreviewView');

    var AssetCollectionView = OriginView.extend({

        tagName: "div",

        className: "asset-management-collection",

        events: {},

        preRender: function() {
            this.filters = [];
            this.collection = new AssetCollection();
            this.listenTo(this.collection, 'sync', this.renderAssetItems);
            this.listenTo(Origin, 'assetManagement:sidebarFilter:add', this.addFilter);
            this.listenTo(Origin, 'assetManagement:sidebarFilter:remove', this.removeFilter);
            this.listenTo(Origin, 'assetManagement:sidebarView:filter', this.filterBySearchInput);
        },

        renderAssetItems: function(filteredCollection) {

            var assetCollection = (filteredCollection || this.collection);

            // Check if collection has items and hide instructions
            if (assetCollection.length > 0) {
                $('.asset-management-no-assets').addClass('display-none');
            }

            // Trigger event to kill zombie views
            Origin.trigger('assetManagement:assetViews:remove');
            // Empty collection container
            this.$('.asset-management-collection-inner').empty();

            // Render each asset item
            assetCollection.each(function(asset) {
                this.$('.asset-management-collection-inner').append(new AssetItemView({model: asset}).$el);
            }, this);

            // Should always check if input has a value and keep the search filter
            this.filterBySearchInput($('.asset-management-sidebar-filter-search').val());

        },

        postRender: function() {
            this.collection.fetch();
        },

        addFilter: function(filterType) {
            // add filter to this.filters
            this.filters.push(filterType);
            this.filterCollection();

        },

        removeFilter: function(filterType) {
            // remove filter from this.filters
            this.filters = _.filter(this.filters, function(item) {
                return item != filterType;
            });

            this.filterCollection();
        },

        filterCollection: function(event) {
            // If this.filters is empty then no filters are applied
            // Instead render all items
            if (this.filters.length === 0) {
                return this.renderAssetItems(this.collection);
            }

            // Filter collection based upon this.filters array
            var filteredCollection = this.collection.filter(function(assetItem) {

                return _.contains(this.filters, assetItem.get('assetType'));

            }, this);

            // Once filter re-render the view
            // Why re-render is so we can use search on the dom elements whilst keeping
            // the filter separate
            this.renderAssetItems(new Backbone.Collection(filteredCollection));

        },

        filterBySearchInput: function(filterText) {
            // Go through each model and hide the ones with this title
            this.collection.each(function(model) {
                if (model.get('title').toLowerCase().indexOf(filterText.toLowerCase()) > -1) {
                    this.$('.id-' + model.get('_id')).removeClass('display-none');
                } else {
                    this.$('.id-' + model.get('_id')).addClass('display-none');
                }

            }, this);
        }

    }, {
        template: 'assetManagementCollection'
    });

    return AssetCollectionView;

});
