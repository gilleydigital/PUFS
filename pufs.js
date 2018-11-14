(function ( $ ) {
	$.fn.pufs = function( options ) {
		// Settings with defaults
		var settings = $.extend({
			paging: 'none', // Options: none, more, pagination
			paging_text: 'Read More',
			paging_html: '<div class="pufs-paging"></div>',
			page_length: 6,
			next_prev: false,
			next_button_html: '<li class="pufs-next-button">Next</li>',
			prev_button_html: '<li class="pufs-prev-button">Previous</li>',
			page_number_html: '<li class="pufs-page-number"></li>',			
			filter: false,
			selector: 'li',
			search: false,
			search_selector: '#pufs-search'
		}, options );
				
		// We store all our data and state stuff here
		var list = this;
		
		// Store the elements we create for later access
		list.elements = {
			pagination: false,
			prev_button: false,
			next_button: false,
			page_numbers: [],
			more_button: false
		};
		
		// Number of child elements
		var list_length = list.children(settings.selector).length;

		// Start out unfiltered
		list.data('filter_by', 'unfiltered');
		
		// No Pagination
		if (settings.paging !== 'none')
		{
			// Hide em all to start
			list.children(settings.selector).hide();

			// Initialize with the length
			list.children(settings.selector)
				.slice(0, settings.page_length)
				.fadeIn();
		}
		
		// 'Read More' Pagination
		if (settings.paging === 'more')
		{
			// For 'read more' lists, revealed keeps track of how many elements haves been revealed
			list.data('revealed', settings.page_length);
			
			// Create the button
			var more_button = $(settings.paging_html)
				.attr('id', 'pufs-read-more')
				.text(settings.paging_text);
			
			// Attach the 'read more' function to the button
			more_button.click(function()
			{
				// Track elements revealed
				var revealed = list.data('revealed');
				var revealed_plus = revealed + settings.page_length;
				
				// Create the selector
				var selector = settings.selector;

				// Track filter status
				var filter_by = list.data('filter_by');

				// If the list is filtered, only show filtered stuff
				if (filter_by !== 'unfiltered')
				{
					selector = selector + '[data-filter="' + filter_by + '"]';
				}

				// Show the selected things
				list.children(selector)
					.slice(revealed, revealed_plus)
					.fadeIn();
								
				// Have we revealed everything so the button is not needed?
				if (revealed_plus >= list_length)
				{
					list.data('revealed', list_length);
					$(this).hide();
				}
				else
				{
					list.data('revealed', revealed_plus);
				}
			});
			
			// Add the button to the elements list for later access
			list.elements.more_button = more_button;
			
			// Add the button to the page
			list.after(more_button);
		}
		
		// Regular Pagination
		if (settings.paging === 'pagination')
		{
			// For paginated lists, revealed keeps track of what page we're on
			list.data('page', 1);
			
			// Calculate the number of pages
			var num_pages = Math.ceil(list_length / settings.page_length);
			list.data('num_pages', num_pages);

			// Create the pagination element
			var pagination = $(settings.paging_html)
				.attr('id', 'pufs-pagination');
			
			// Add the list elements
			for (var i = 1; i <= num_pages; i++) {
				var page_number = $(settings.page_number_html)
					.data('pufs-page-number', i)
					.text(i);
				
				// User clicks page number
				page_number.bind('click', go_to_page(list, settings, i));

				// Add the button to the elements list for later access
				list.elements.page_numbers.push(page_number);

				// Add the button to the page
				pagination.append(page_number);
			}
			
			// Create next/prev buttons if applicable
			if (settings.next_prev === true) {
				// Prev Button
				var prev_button = $(settings.prev_button_html)
					.hide();

				// Next Button
				var next_button = $(settings.next_button_html)
					.hide();
					
				// User clicks prev
				prev_button.bind('click', go_to_page(list, settings, 'prev'));
				
				// User clicks next
				next_button.bind('click', go_to_page(list, settings, 'next'));
					
				// Add the buttons to the elements list for later access
				list.elements.prev_button = prev_button;
				list.elements.next_button = next_button;

				// Add the buttons to the page
				pagination.prepend(prev_button);
				pagination.append(next_button);
			}

			// Add the pagination to the elements list for later access
			list.elements.pagination = pagination;
			
			// Add the pagination to the page
			list.after(pagination);
			
			if (num_pages >= 1) {
				next_button.fadeIn();
			}
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

				// Set the variable on the list
				list.data('filter_by', filter_by);
				
				// Create the selector
				var selector = settings.selector;

				// Refine the selector
				if (filter_by !== 'unfiltered')
				{
					selector = settings.selector + '[data-filter="' + filter_by + '"]';
				}

				// Hide em all
				list.children(settings.selector).hide();
				
				if (settings.paging === 'none')
				{
					list.children(selector).fadeIn();
				}
				
				if (settings.paging === 'more')
				{
					// How much is already revealed
					var revealed = list.data('revealed');
					var revealed_plus = list.children(selector).slice(0, revealed).size();
					var filtered_list_length = list.children(selector).size();
					
					// Keep the number of revealed lines constant, change content as needed
					list.children(selector)
						.slice(0, revealed)
						.fadeIn();
										
					// If you have reached the end of the list...
					if (revealed_plus >= filtered_list_length)
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
					list.data('page', 1);
					
					list_length = list.children(selector).length;

					// Calculate the number of pages
					var num_pages = Math.ceil(list_length / settings.page_length);

					var pagination_html = '';

					// Add the list elements
					for (var i = 1; i <= num_pages; i++) {
						pagination_html = pagination_html + '<li>' + i + '</li>';
					}

					$('#pufs-pagination').html(pagination_html);
					
					var from = 0;
					var to = settings.page_length;

					list.children(selector)
						.slice(from, to)
						.fadeIn();
						
					// Update next/prev buttons
					if (settings.next_prev === true) {
						// Next Button
						if (target_page === list.data('num_pages')) {
							$('#pufs-next').hide();
						}
						else {
							$('#pufs-next').fadeIn();
						}

						$('#pufs-prev').hide();
					}
					
				}
			});
		}
		
		// Searching
		if (settings.search !== false) {
			// setup before functions
			var typingTimer; // timer identifier
			var doneTypingInterval = 100;  // time in ms (5 seconds)
			var selector = settings.search_selector;

			//on keyup, start the countdown
			$(selector).keyup(function(){
			    clearTimeout(typingTimer);
		        typingTimer = setTimeout(doneTyping, doneTypingInterval, $(selector).val());
			});

			//user is "finished typing," do something
			function doneTyping (val) {
				var search = val.toLowerCase();

				// Create the selector
				var selector = settings.selector;

				// Refine the selector
				if (search !== '')
				{
					selector = settings.selector + '[data-search-content*="' + search + '"]';
				}
								
				// Hide em all
				list.children(settings.selector).hide();
				
				if (settings.paging === 'none')
				{
					list.children(selector).fadeIn();
				}
				
				if (settings.paging === 'more')
				{
					// How much is already revealed
					var revealed = list.data('revealed');
					var revealed_plus = list.children(selector).slice(0, revealed).size();
					var filtered_list_length = list.children(selector).size();
					
					// Keep the number of revealed lines constant, change content as needed
					list.children(selector)
						.slice(0, revealed)
						.fadeIn();
										
					// If you have reached the end of the list...
					if (revealed_plus >= filtered_list_length)
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
					list.data('page', 1);
					
					list_length = list.children(selector).length;

					// Calculate the number of pages
					var num_pages = Math.ceil(list_length / settings.page_length);

					var pagination_html = '';

					// Add the list elements
					for (var i = 1; i <= num_pages; i++) {
						pagination_html = pagination_html + '<li>' + i + '</li>';
					}

					$('#pufs-pagination').html(pagination_html);
					
					var from = 0;
					var to = settings.page_length;

					list.children(selector)
						.slice(from, to)
						.fadeIn();
				}
				
				
				
				
				
			}
		}
		
		return this;
	};
	
	function go_to_page(list, settings, target) {
		return function() {
			var target_page;
			var current_page = list.data('page');

			// Set the list page
			if (target === 'prev') {
				target_page = current_page - 1;
			}
			else if (target === 'next') {
				target_page = current_page + 1;			
			}
			else if ($.isNumeric(target)) {
				target_page = target;
			}

			// Active class for styling
			$('#pufs-pagination .pufs-page-number').removeClass('active');
			$('#pufs-pagination .pufs-page-number[data-pufs-page-number="'+ target_page +'"]').addClass('active');

			// Hide all the list elements
			list.children(settings.selector)
				.hide();

			// Fade in the list elements
			var from = (target_page - 1) * settings.page_length;
			var to = target_page * settings.page_length;

			list.children(settings.selector)
				.slice(from, to)
				.fadeIn();

			// Keep track of what page we're on
			list.data('page', target_page);

			// Update next/prev buttons
			if (settings.next_prev === true) {
				// Next Button
				if (target_page === list.data('num_pages')) {
					$('.pufs-next-button').hide();
				}
				else {
					$('.pufs-next-button').fadeIn();
				}

				// Previous Button
				if (target_page === 1) {
					$('.pufs-prev-button').hide();
				}
				else {
					$('.pufs-prev-button').fadeIn();
				}						
			}
		}
	}
	
}( jQuery ));
