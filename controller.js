jQuery(function($) {
	$( document ).ready(function() {
		var pufs_obj = $( "#list" ).pufs({
			paging: 'pagination',
			filter: '#filter',
			next_prev: true,
			search: true
		});
	});
});
