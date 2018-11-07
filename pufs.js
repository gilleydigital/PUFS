(function ( $ ) {
	$.fn.pufs = function( options ) {
		// Settings with defaults
		var settings = $.extend({
			paging: 'none', // Options: none, more, pagination
			paging_text: 'Read More',
			paging_html: '<div class="pufs-paging"></div>',
			page_length: 6,
			filter: false,
			selector: 'li'
		}, options );
				
		// Target is always the list, for sub-functions
		var target = this;
		// Number of child elements
		var target_length = target.children(settings.selector).length;
		// Start out unfiltered
		target.data('filter_by', 'unfiltered');
		
		// No Pagination
		if (settings.paging !== 'none')
		{
			// Hide em all to start
			this.children().hide();

			// Initialize with the length
			this.children()
				.slice(0, settings.page_length)
				.fadeIn();
		}
		
		// 'Read More' Pagination
		if (settings.paging === 'more')
		{
			// For 'read more' lists, revealed keeps track of how many elements haves been revealed
			this.data('revealed', settings.page_length);
			
			// Create the button
			var button = $(settings.paging_html)
				.attr('id', 'pufs-read-more')
				.text(settings.paging_text);
			
			target.after(button);
			
			// Attach the 'read more' function to the button
			$('body').on('click', '#pufs-read-more', function()
			{
				// Track elements revealed
				var revealed = target.data('revealed');
				var revealed_plus = revealed + settings.page_length;
				
				// Create the selector
				var selector = settings.selector;

				// Track filter status
				var filter_by = target.data('filter_by');

				// If the list is filtered, only show filtered stuff
				if (filter_by !== 'unfiltered')
				{
					selector = selector + '[data-filter="' + filter_by + '"]';
				}

				// Show the selected things
				target.children(selector)
					.slice(revealed, revealed_plus)
					.fadeIn();
								
				// Have we revealed everything so the button is not needed?
				if (revealed_plus >= target_length)
				{
					target.data('revealed', target_length);
					$('#pufs-read-more').hide();
				}
				else
				{
					target.data('revealed', revealed_plus);
				}
			});
		}
		
		// Regular Pagination
		if (settings.paging === 'pagination')
		{
			// For paginated lists, revealed keeps track of what page we're on
			this.data('page', 1);
			
			// Calculate the number of pages
			var num_pages = Math.ceil(target_length / settings.page_length);

			// Create the pagination element
			var pagination = $(settings.paging_html)
				.attr('id', 'pufs-pagination');
			
			// Add the list elements
			for (var i = 1; i <= num_pages; i++) {
				pagination.append('<li>' + i + '</li>');
			}
			
			// Create the pagination
			target.after(pagination);
			
			$('#pufs-pagination').delegate('li', 'click', function()
			{
				// Active class for styling
				$('#pufs-pagination li').removeClass('active');
				$(this).addClass('active');
				
				// Fade in the right page
				var target_page = $(this).index() + 1;
				
				target.children()
					.hide();
					
				var from = (target_page - 1) * settings.page_length;
				var to = target_page * settings.page_length;
				
				target.children()
					.slice(from, to)
					.fadeIn();
				
				// Keep track of what page we're on
				target.data('page', target_page);
			});
		}
		
		// Filtering
		if (settings.filter !== false)
		{
			// Filter is the selector for the filter element
			var filter = $(settings.filter);
			
			// The filtering event
			filter.on('click', 'li', function() {
				// What are we filtering by
				var filter_by = $(this).data('filter');
				// Set the variable on the target
				target.data('filter_by', filter_by);
				
				// Create the selector
				var selector = settings.selector;

				// Refine the selector
				if (filter_by !== 'unfiltered')
				{
					selector = settings.selector + '[data-filter="' + filter_by + '"]';
				}

				// Hide em all
				target.children().hide();
				
				if (settings.paging === 'none')
				{
					target.children(selector).fadeIn();
				}
				
				if (settings.paging === 'more')
				{
					// How much is already revealed
					var revealed = target.data('revealed');
					var revealed_plus = target.children(selector).slice(0, revealed).size();
					var filtered_target_length = target.children(selector).size();
					
					// Keep the number of revealed lines constant, change content as needed
					target.children(selector)
						.slice(0, revealed)
						.fadeIn();
										
					// If you have reached the end of the list...
					if (revealed_plus >= filtered_target_length)
					{
						$('#pufs-read-more').hide();
					}
					else
					{
						$('#pufs-read-more').show();
					}
				}
				
				if (settings.paging === 'pagination')
				{
					// For paginated lists, revealed keeps track of what page we're on
					target.data('page', 1);
					
					target_length = target.children(selector).length;

					// Calculate the number of pages
					var num_pages = Math.ceil(target_length / settings.page_length);

					var pagination_html = '';

					// Add the list elements
					for (var i = 1; i <= num_pages; i++) {
						pagination_html = pagination_html + '<li>' + i + '</li>';
					}

					$('#pufs-pagination').html(pagination_html);
					
					var from = 0;
					var to = settings.page_length;

					target.children(selector)
						.slice(from, to)
						.fadeIn();
					
				}
			});
		}
		
		return this;
	};
}( jQuery ));