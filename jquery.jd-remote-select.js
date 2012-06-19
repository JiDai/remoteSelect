/*

Remote Select form plugin
Copyright © 2012 Jordi Dosne
http://www.Dosne.net

Requires jQuery 1.4 or newer
Requires jQuery Metadata

Allow to a select form to get json data.

Enjoy!

*/
	
(function($) {

	$.jdRemoteSelect = {
		defaults: {
			keepFirstOption : false,
			keepLastOption : false,
			subSelect : null,
			labelProperty : "label",
			valueProperty : "id",
			autoLoad : true,
			defaultValue : '',
			data: {}
		},
		elements: []
	};
	
	var methods =
	{
		init : function(options)
		{
			return this.each(function()
			{
				var $this = $(this);
				
				if( $this.metadata === undefined ) {
					throw new Error('jQuery Metadata must be imported'); }
				
				// If the plugin hasn't been initialized yet
				if ( !$.data(this, 'jdRemoteSelectParams') )
				{
					var params = $.extend({}, $.jdRemoteSelect.defaults, $this.metadata(), options);
					params.data.method = "get";
					
					if( params.subSelectTarget !== undefined && params.subSelectTarget !== "" ) {
						params.subSelect = $(params.subSelectTarget); }
					else {
						params.subSelect = null; }
						
					$.data(this, 'jdRemoteSelectParams', params);
								
					if( params.data.url === undefined || params.data.url === "" ) {
						return; }
						
					if( params.autoLoad === true )
					{
						//$this.jdRemoteSelect('loadData');
						methods.loadData.apply($this, []);
					}
					params = null;
				}
			});
		},
		loadData : function( )
		{
			var $this = this;
			var params = $.data($this[0], 'jdRemoteSelectParams');
			$this.attr('disabled', 'disabled');
			
			var result = $.parseJSON($.ajax(
			{
				url : params.data.url,
				dataType: 'json',
				data : params.data,
				async: false
			}).responseText);

			var len = result.length;
			if( result.length === 0 )
			{
				$this.hide();
				return;
			}
			
			if( params.keepFirstOption === true ) {
				$this.find('option:gt(0)').remove(); }
			else if( params.keepLastOption === true ) {
				$this.find('option:lt('+($this.find('option').length-1)+')').remove(); }
			else {
				$this.find('option').remove(); }
			
			// Populate select
			for( var i = 0; i < len; i++ )
			{
				$this.append("<option value="+result[i][params.valueProperty]+">"+result[i][params.labelProperty]+"</option>");
			}
			
			// Set default Value
			if( params.defaultValue !== '' )
			{
				$this.find('option:selected').removeAttr('selected');
				$this.find('option[value='+params.defaultValue+']').attr('selected', 'selected');
			}
			
			// Show the select
			$this.removeAttr('disabled');
			$this.show();

			// If sub select is set, initialize it and link changeEvent to it
			if( params.subSelect !== null && params.subSelect.length > 0 )
			{
				var sub = params.subSelect;
				sub.jdRemoteSelect({autoLoad:false});
				sub.hide();
				$this.bind('change', function(e)
				{
					e.preventDefault();
					var $this = $(e.target);
					var dataSubSelect = $.data(sub[0], 'jdRemoteSelectParams').data[$this.attr('name')] = $this.val();
					methods.loadData.apply(sub, []);
				});
				if( params.defaultValue !== undefined && params.defaultValue !== '' )
				{
					var dataSubSelect = $.data(sub[0], 'jdRemoteSelectParams').data[$this.attr('name')] = $this.val();
					methods.loadData.apply(sub, []);
				}
			}
			$this = null;
			params = null;
		},
		set : function( key, value )
		{
			var $this = $(this);
			var params = $this.jdRemoteSelectParams;
			params[key] = value;
		},
		get : function( key )
		{
			var $this = $(this);
			var params = $this.jdRemoteSelectParams;
			return params[key];
		}
	};



	$.fn.jdRemoteSelect = function(methodOrOptions) {
		if ( methods[methodOrOptions] ) {
			return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
			// Default to "init"
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tooltip' );
		}
	};
})(jQuery);




