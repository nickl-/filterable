(function($) {
  'use strict';
  
  var Filterable = function (element, options) {
    this.$element = $(element);
    this.rows = null;
    //data-* has more priority over js options: because dynamically created elements may change data-*
    this.options = $.extend({}, $.fn.filterable.defaults, options);
    this.init();
  };
  
  Filterable.prototype = {
    constructor: Filterable,
    
    notNull: function(value) {
      if(value !== undefined && value !== null) {
        return true;
      }
      return false;
    },
    
    ignoredColumn: function(index) {
      if( this.notNull(this.options.onlyColumns) ) {
        return $.inArray(index, this.options.onlyColumns) === -1;
      }
      return $.inArray(index, this.options.ignoreColumns) !== -1;
    },
    
    filter: function(query, cellIndex) {
      if(!this.notNull(this.rows)){
        this.initRows();
      }
      $.each(this.rows, $.proxy(function(rowIndex, row) {
        row.filter(query, cellIndex);
      }, this));
    },
    
    initEditable: function(editableElement, index) {
      $(editableElement).editable($.extend({
        send: 'never',
        type: 'text',
        emptytext: '',
        value: '',
        title: 'Enter filter for ' + $(editableElement).text(),
        display: function() {}
      }, this.options.editableOptions));
      
      $(editableElement).on('save.editable', $.proxy(function(e, params) {
        if(params.newValue === ''){
          $(editableElement).removeClass('filterable-active');
        } else {
          $(editableElement).addClass('filterable-active');
        }
        this.filter(params.newValue, index);
      }, this));
    },
    
    initRows: function() {
      this.rows = [];
      this.$element.children('tbody,*').children('tr').each( $.proxy(function(rowIndex, row) {
        if(rowIndex !== 0){
          $(row).filterableRow(this.options);
          this.rows.push( $(row).data('filterableRow') );
        }
      }, this));
    },
    
    init: function () {
        //add 'filterable' class to every editable element
        this.$element.addClass('filterable');
        
        // Init X-editable for each heading
        this.$element.find('tr:first').first().children('td,th').each( $.proxy(function(index, heading) {
          if( !this.ignoredColumn(index) ) {
            var editableElement = this.options.editableSelector;
            if(!this.notNull(editableElement)) {
              // Wrap heading content in div to force editable popup within <tr>
              editableElement =  $(heading).wrapInner('<div />').children().first();
            }
            this.initEditable(editableElement, index);
          }
        }, this));
        
        //finilize init
        $.proxy(function() {
           /**
           Fired when element was initialized by `$().filterable()` method.
           Please note that you should setup `init` handler **before** applying `filterable`.
                          
           @event init
           @param {Object} event event object
           @param {Object} editable filterable instance (as here it cannot accessed via data('editable'))
           **/
           this.$element.triggerHandler('init', this);
        }, this);
    },
    
    /**
    Removes filterable feature from element
    @method destroy()
    **/
    destroy: function() {
      this.$element.removeClass('filterable');
      this.$element.removeData('fitlerable');
    }
  };
  
  // Initilize each filterable table
  $.fn.filterable = function (option) {
    //special API methods returning non-jquery object
    var args = arguments, datakey = 'filterable';
    
    //return jquery object
    return this.each(function () {
      var $this = $(this),
        data = $this.data(datakey),
        options = typeof option === 'object' && option;

      if (!data) {
        $this.data(datakey, (data = new Filterable(this, options)));
      }

      if (typeof option === 'string') { //call method
        data[option].apply(data, Array.prototype.slice.call(args, 1));
      }
    });
  };
  
  $.fn.filterable.defaults = {
    /**
    Column indexes to not make filterable
    @property ignoreColumns
    @type array
    @default []
    **/
    ignoreColumns: [],
    
    /**
    Column indexes to make filterable, all other columns are left non-filterable.
    **Note**: This takes presidence over <code>ignoreColumns</code> when both are provided.
    @property onlyColumns
    @type array
    @default null
    **/
    onlyColumns: null,
    
    /**
    Sets case sensitivity
    @property ignoreCase
    @type boolean
    @default true
    **/
    ignoreCase: true,
    
    /**
    Additional options for X-editable
    @property editableOptions
    @type object
    @default null
    **/
    editableOptions: null,
    
    /**
    Selector to use when making the editable item
    @property editableSelector
    @type string
    @default null
    **/
    editableSelector: null
  };
})(jQuery);