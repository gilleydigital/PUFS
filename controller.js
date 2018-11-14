jQuery(function($) {
	$( document ).ready(function() {
		$( "#list" ).pufs({
			paging: 'pagination',
			filter: '#filter',
			next_prev: true,
			next_text: 'Next Page',
			prev_text: 'Previous Page',
			search: true
		});
	});
});
