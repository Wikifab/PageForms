/**
 * Code to integrate the pfGrid JavaScript library into Page Forms.
 *
 * @author Yaron Koren
 * @author Balabky9
 */
/* global jsGrid, mw */
/*jshint esversion: 6 */
(function(jsGrid, $, undefined) {
	/**
	 * The following code handles the 'date' input type within the grid.
	 * insertTemplate preprocesses the value and returns it to the grid cell to display;
	 * editTemplate/insertTemplate generate the edition/insertion forms;
	 * editValue/insertValue is in charge of putting the final values into the grid.
	 */

	// Global variables to store edit and insert values to be used
	// by the editValue and insertValue functions to put them into
	// the date field.
	var Global_Edit_day_of_month;
	var Global_Edit_month;
	var Global_Edit_year;
	var Global_Insert_day_of_month;
	var Global_Insert_month;
	var Global_Insert_year;

	// Create month selector dropdown.
	function buildSelect( currentMonth ) {
		var monthNames = mw.config.get('wgMonthNamesShort');
		var str = '<select class="pf_jsGrid_month" style=" width: 100% !important; font-size:14px;">';
		for (var val=0; val<=12; val++) {
			var val2;
			if (val < 10) { //Adds a leading 0 to single digit months, ex 01 instead of 1.
				val2 = "0" + val;
			} else {
				val2 = val;
			}
			var option = '<option ';
			if (val === currentMonth) {
				option += 'selected="selected" ';
			}
			option += 'value="' + val2 + '">' + monthNames[val] + '</option>';
			str += option;
		}
		str += '</select>';
		return str;
	}

	var PFDateField = function(config) {
		jsGrid.Field.call(this, config);
	};

	PFDateField.prototype = new jsGrid.Field({
		sorter: function(date1, date2) {
			return new Date(date1) - new Date(date2);
		},

		itemTemplate: function(value) {
			return value;
		},

		insertTemplate: function(value) {
			var html_day = '<div style="float:left; width:19%;"><label style="display:block; text-align:center; font- size:14px;">DD:</label><input class="pf_jsGrid_day" style=" font-size:14px; " type="text" value="" placeholder="DD"></input></div>';
			var html_year = '<div style="float:left; width:29%;"><label style="display:block; text-align:center; width:29%; font-size:14px;">YYYY:</label><input class="pf_jsGrid_year" style=" font-size:14px; " type="text" value="" placeholder="YYYY"></input></div>';
			var html_month = '<div style="float:left; width:48%; margin-left:2%; margin-right:2%;"><label style="display:block; text-align:center; font-size:14px;">MM:</label>' + buildSelect(0) + '</div>';
			var fullDateInputHTML = '<div class="pf_jsGrid_ymd_form">';
			if ( mw.config.get('wgAmericanDates') ) { //check for date-style format.
				fullDateInputHTML += html_month + html_day + html_year;
			} else {
				fullDateInputHTML += html_day + html_month + html_year;
			}
			fullDateInputHTML += '</div>';

			$('.pfJSGrid').on('click propertychange change keyup input paste', function() {
				Global_Insert_day_of_month = $('.pf_jsGrid_day').val();
				Global_Insert_year = $('.pf_jsGrid_year').val();
				Global_Insert_month = $('.pf_jsGrid_month').val();
			});

			return fullDateInputHTML;
		},

		editTemplate: function(value) {
			var display_day_of_month = '';
			var display_year = '';
			var display_month = 0;
			if ( value !== null ) {
				var dateObject = new Date(value);
				display_day_of_month = dateObject.getDate();
				display_year = dateObject.getFullYear();
				display_month = dateObject.getMonth();
			}
			var fullDateInputHTML = '<div class="pf_jsGrid_ymd_form">';
			var html_day = '<div style="float:left; width:19%;"><label style="display:block; text-align:center; font-size:14px;">DD:</label><input  class="pf_jsGrid_day" style=" font-size:14px; " type="text" value=' + display_day_of_month + '></input></div>';
			var html_year = '<div style="float:left; width:29%;"><label style="display:block; text-align:center; width:29%; font-size:14px;">YYYY:</label><input class="pf_jsGrid_year" style=" font-size:14px; " type="text" value=' + display_year + '></input></div>';
			var html_month = '<div style="float:left; width:48%; margin-left:2%; margin-right:2%;"><label style="display:block; text-align:center; font-size:14px;">MM:</label>' + buildSelect(display_month + 1) + '</div>';
			if ( mw.config.get('wgAmericanDates') ) { //check for date-style format.
				fullDateInputHTML += html_month + html_day + html_year;
			} else {
				fullDateInputHTML += html_day + html_month + html_year;
			}
			fullDateInputHTML += '</div>';

			/*
			 * Always use eq(1) on the edit functions since jsGrid
			 * has a hidden insert row, so you have to ignore that
			 * row else you will capture
			 */
			$('.pfJSGrid').on('click propertychange change keyup input paste', function() {
				Global_Edit_day_of_month = $('.pf_jsGrid_day').eq(1).val();
				Global_Edit_year = $('.pf_jsGrid_year').eq(1).val();
				Global_Edit_month = $('.pf_jsGrid_month').eq(1).val();
			});

			return fullDateInputHTML;
		},

		insertValue: function() {
			if ( Global_Insert_year === undefined || Global_Insert_year === "" ) {
				return null;
			}
			var ret = Global_Insert_year + "-" + Global_Insert_month + "-" + Global_Insert_day_of_month;
			return ret;
		},

		editValue: function(value) {
			if ( Global_Edit_year === undefined || Global_Edit_year === "" ) {
				return null;
			}
			var ret = Global_Edit_year + "-" + Global_Edit_month + "-" + Global_Edit_day_of_month;
			return ret;
		}
	});

	jsGrid.fields.date = PFDateField;

}(jsGrid, jQuery));

( function ( $, mw, pf ) {

	$( '.pfJSGrid' ).each( function() {
		var gridParams = mw.config.get( 'wgPageFormsGridParams' ),
			gridValues = mw.config.get( 'wgPageFormsGridValues' );
		var $gridDiv = $( this );
		var templateName = $gridDiv.attr( 'data-template-name' );
		var formName = $gridDiv.attr( 'data-form-name' );
		var gridHeight = $gridDiv.attr( 'height' );
		var editMultiplePages = $gridDiv.attr( 'editMultiplePages' );
		var baseUrl = mw.config.get( 'wgScriptPath' );
		if ( gridHeight === undefined ) { gridHeight = '400px'; }
		// The slice() is necessary to do a clone, so that
		// gridParams does not get modified.
		var templateParams = gridParams[templateName].slice(0);
		// Different controls depending on whether it's
		// Special:MultiPageEdit or "display=spreadsheet".
		if ( editMultiplePages !== undefined ) {
			templateParams.push( { type: 'control', deleteButton: false } );
		} else {
			templateParams.push( { type: 'control' } );
		}
		var dataValues = [];
		var pages = [];
		var cancelUpdate = 0;
		if ( editMultiplePages !== undefined ) {
			$.ajax({
				url: baseUrl + '/api.php?action=query&format=json&list=embeddedin&eilimit=500&eititle=Template:' + templateName,
				dataType: 'json',
				type: 'POST',
				async: false,
				headers: { 'Api-User-Agent': 'Example/1.0' },
				success: function(data) {
					var pageObjects = data.query.embeddedin;
					for ( var i = 0; i < pageObjects.length; i++ ) {
						pages.push( encodeURIComponent( pageObjects[i].title ) );
					}
					pages.sort(function( a, b ){ return a.toUpperCase().localeCompare( b.toUpperCase() ); });

				},
				error: function(xhr, status, error){
					mw.notify( "ERROR: Unable to retrieve pages for the selected template", { type: 'error' } );
				}
			});
		}

		function getGridValues( pageNames ) {
			return $.ajax({
				url: baseUrl + '/api.php?action=query&format=json&prop=revisions&rvprop=content&formatversion=2&titles=' + pageNames,
				dataType: 'json',
				type: 'POST',
				headers: { 'Api-User-Agent': 'Example/1.0' }
			});
		}

		function getTemplateCalls( pageContent, pageName ) {
			var startDelimiter = '{{' + templateName.toLowerCase();
			var endDelimiter = '}}';
			var contents = [];
			var startFrom, contentStart, contentEnd;
			startFrom = contentStart = contentEnd = 0;
			while ( -1 !== ( contentStart = pageContent.toLowerCase().indexOf( startDelimiter, startFrom ) ) ) {
				contentEnd = pageContent.indexOf( endDelimiter, contentStart );
				if ( contentEnd === -1 ) {
					break;
				}
				var content = pageContent.substring( contentStart + startDelimiter.length, contentEnd );
				contents.push( 'page=' + pageName + content );
				startFrom = contentEnd + 1;
			}
			return contents;
		}

		function getQueryString( preEdit, postEdit ){
			var queryString = "";
			$.each( postEdit, function( key, value ) {
				if ( value !== preEdit[key] && key !== 'page' ) {
					queryString += '&' + templateName + '[' + key + ']' + '=' + value;
				}
			});
			return queryString;
		}

		function getToken() {
			var url = baseUrl + '/api.php?action=query&format=json&meta=tokens&type=csrf';
			return $.post( url );
		}

		function movePage( fromPage, toPage ) {
			return $.when( getToken() ).then( function successHandler( postResult ){
				var data = {};
				var token = postResult.query.tokens.csrftoken;
				data.token = token;
				var query = 'from=' + encodeURIComponent( fromPage ) + "&to=" + encodeURIComponent( toPage ) + "&movetalk&noredirect";
				return $.ajax( {
					type:     'POST',
					url:      baseUrl + '/api.php?action=move&format=json&' + query,
					dataType: 'json',
					data:     data
				} );
			});
		}

		function updatePage( args, queryString ) {
			if ( queryString !== "") {
				var data = {
					action: 'pfautoedit',
					format: 'json'
				};
				data.query = 'form=' + formName + '&target=' + encodeURIComponent( args.previousItem.page ) + encodeURI( queryString );
				return $.ajax( {
					type:     'POST',
					url:      baseUrl + '/api.php',
					data:     data,
					dataType: 'json'
				} );
			} else {
				var result = { status: 200 };
				return result;
			}
		}

		function addPage( args ){
			var queryString = "";
			$.each( args.item, function( key, value ) {
				if ( key !== "page" ) {
					if ( value === "" ) {
						value = " ";
					}
					queryString += '&' + templateName + '[' + key + ']' + '=' + value;
				}
			});
			var data = {
				action: 'pfautoedit',
				format: 'json'
			};
			data.query = 'form=' + formName + '&target=' + encodeURIComponent( args.item.page ) + encodeURI( queryString );
			return $.ajax( {
				type:     'POST',
				url:      baseUrl + '/api.php',
				data:     data,
				dataType: 'json'
			} );
		}

		var ooJSUIModule = 'oojs-ui-widgets';
		if ( mw.loader.getVersion( 'oojs-ui-widgets' ) === null ) {
			// MW < 1.29 (?)
			ooJSUIModule = 'oojs-ui';
		}

		mw.loader.using( ooJSUIModule ).done( function () {
			$( function () {

				var option1 = new OO.ui.ButtonOptionWidget( {
				    data: 1,
				    label: '25',
				    title: 'Button option 1'
				} );
				var option2 = new OO.ui.ButtonOptionWidget( {
				    data: 2,
				    label: '50',
				    title: 'Button option 2'
				} );
				var option3 = new OO.ui.ButtonOptionWidget( {
				    data: 3,
				    label: '100',
				    title: 'Button option 3'
				} );
				var option4 = new OO.ui.ButtonOptionWidget( {
				    data: 4,
				    label: '250',
				    title: 'Button option 4'
				} );

				var buttonSelect = new OO.ui.ButtonSelectWidget( {
				    items: [ option1, option2, option3, option4 ]
				} );

				var popupButton = new OO.ui.PopupButtonWidget( {
				  label: 'Results to show',
				  popup: {
				    $content: buttonSelect.$element,
				    padded: true,
					width: 'auto',
				    align: 'forwards'
				  }
				} );

				buttonSelect.selectItem( option1 );
				option1.on( 'click', function () {
					$gridDiv.jsGrid("option", "pageSize", 25);
				} );
				option2.on( 'click', function () {
					$gridDiv.jsGrid("option", "pageSize", 50);
				} );
				option3.on( 'click', function () {
					$gridDiv.jsGrid("option", "pageSize", 100);
				} );
				option4.on( 'click', function () {
					$gridDiv.jsGrid("option", "pageSize", 250);
				} );

				$( '#selectLimit' ).append( popupButton.$element );

			} );
		} );

		var PFPageLoadingStrategy = function(grid) {
		    jsGrid.loadStrategies.PageLoadingStrategy.call(this, grid);
		};

		PFPageLoadingStrategy.prototype = new jsGrid.loadStrategies.PageLoadingStrategy();

		PFPageLoadingStrategy.prototype.finishInsert = function(insertedItem) {
			var grid = this._grid;
			grid.option("data").unshift(insertedItem);
			grid.refresh();
		};

		PFPageLoadingStrategy.prototype.finishDelete = function(deletedItem, deletedItemIndex) {
			var grid = this._grid;
			grid.option("data").splice(deletedItemIndex, 1);
			grid.refresh();
		};

		$gridDiv.jsGrid({
			width: "100%",
			height: gridHeight,

			editing: true,
			inserting: true,
			confirmDeleting: false,

			autoload: ( editMultiplePages === undefined ) ? false : true,
			paging: ( editMultiplePages === undefined ) ? false : true,
			pageSize: 25,
			pageIndex: 1,

			loadStrategy: function() {
				return new PFPageLoadingStrategy(this);
			},

			data: gridValues[templateName],
			fields: templateParams,

			controller: {
				loadData: function ( filter ) {
					$gridDiv.css( "visibility", "hidden" );
					$("#selectLimit").css( "visibility", "hidden" );
					$("#loadingImage").css( "display", "block" );
					var start = filter.pageSize * ( filter.pageIndex - 1 );
					var end = start + filter.pageSize;
					dataValues = [];
					var pageNames = "";

					if ( pages.length > 0 ) {
						for (var i = start; ( i < end - 1 ) && ( i < pages.length - 1 ); i++) {
							pageNames += pages[i] + "|";
						}
						pageNames += pages[i];
						return $.when( getGridValues( pageNames ) ).then( function successHandler( data ) {
							var templateCalls = [];
							data.query.pages.sort(function( a, b ){ return a.title.toUpperCase().localeCompare( b.title.toUpperCase() ); });
							for (var i = 0; i < data.query.pages.length; i++) {
								var pageContent = data.query.pages[i].revisions[0].content;
								templateCalls = getTemplateCalls( pageContent, data.query.pages[i].title );
								for ( const templateCall of templateCalls ) {
									var fieldArray = templateCall.split( '|' );
									var fieldValueObject = {};
									for ( const field of fieldArray ) {
										var equalPos = field.indexOf( '=' );
										var fieldLabel = field.substring( 0, equalPos );
										var fieldValue = field.substring( equalPos + 1 );
										fieldLabel = fieldLabel.replace(/(\r\n\t|\n|\r\t)/gm,"");
										fieldValueObject[fieldLabel] = fieldValue.replace(/(\r\n\t|\n|\r\t)/gm,"");
									}
									dataValues.push( fieldValueObject );
								}
							}
							var dataResult = {
								data: dataValues,
								itemsCount: dataValues.length
							};
							$("#loadingImage").css( "display", "none" );
							$gridDiv.css( "visibility", "visible" );
							$("#selectLimit").css( "visibility", "visible" );
							return dataResult;
						}, function errorHandler( jqXHR, textStatus, errorThrown ){
							mw.notify( "ERROR: Unable to retrieve pages", { type: 'error' } );
							return false;
						});
					}
				}
			},

			_pagesCount: function() {
				var pageSize = this.pageSize;
				return Math.ceil( pages.length / pageSize );
			},

			onOptionChanging: function( args ){
				if ( $('#insertjsGridComboBox').length ) {
					var insertcombobox = new pf.select2.combobox();
					insertcombobox.apply( $('#insertjsGridComboBox') );
				}
				if ( $('#insertjsGridTokens').length ) {
					var inserttokens = new pf.select2.tokens();
					inserttokens.apply( $('#insertjsGridTokens') );
				}
			},

			onEditRowCreated: function( args ) {
				if ( $('#jsGridComboBox').length ) {
					var combobox = new pf.select2.combobox();
					combobox.apply( $('#jsGridComboBox') );
				}
				if ( $('#jsGridTokens').length ) {
					var tokens = new pf.select2.tokens();
					tokens.apply( $('#jsGridTokens') );
				}

				args.editRow.keypress( function( e ) {
					// Make the "Enter" key approve an update.
					if ( e.which === 13 ) {
						$gridDiv.jsGrid("updateItem");
						e.preventDefault();
					}
				});
				args.editRow.find( 'textarea' ).keypress( function( e ) {
					if ( e.which === 10 ) {
						$(this).addNewlineAtCursor();
					}
				});
			},

			onInsertRowCreated: function( args ) {
				args.insertRow.keypress( function( e ) {
					// Make the "Enter" key approve an insert.
					if ( e.which === 13 ) {
						$gridDiv.jsGrid("insertItem");
						$gridDiv.jsGrid("clearInsert");
						e.preventDefault();
					}
				});
				args.insertRow.find( 'textarea' ).keypress( function( e ) {
					if ( e.which === 10 ) {
						$(this).addNewlineAtCursor();
					}
				});

			},

			onItemUpdating: function( args ){
				if ( editMultiplePages === undefined || cancelUpdate === 1 ) {
					cancelUpdate = 0;
					return;
				}
				var queryString = getQueryString( args.previousItem, args.item );
				if ( queryString !== "" || args.previousItem.page !== args.item.page ) {
					$.when( updatePage( args, queryString ) ).then( function successHandler( result ) {
						if ( result.status === 200 ) {
							if ( queryString !== "" ) {
								mw.notify( 'Update Successful' );
							}

							if ( args.previousItem.page !== args.item.page ) {
								$.when( movePage( args.previousItem.page, args.item.page ) ).then( function successHandler( result ) {
									if ( "error" in result ) {
										// args.cancel = true;
										mw.notify( "Error in renaming page: " + result.error.info, { type: 'error' } );
										cancelUpdate = 1;
										$gridDiv.jsGrid("updateItem", args.item, args.previousItem );
									} else {
										mw.notify( 'Update Successful: moved page "' + args.previousItem.page + '" to "' + args.item.page + '"' );
									}
								}, function errorHandler( jqXHR, textStatus, errorThrown ){
									var result = jQuery.parseJSON(jqXHR.responseText);
									var text = result.responseText;

									for ( var i = 0; i < result.errors.length; i++ ) {
										text += ' ' + result.errors[i].message;
									}
									// args.cancel = true;
									mw.notify( "ERROR: " + text, { type: 'error' } );
									cancelUpdate = 1;
									$gridDiv.jsGrid("updateItem", args.item, args.previousItem );
								});
							}

						} else {
							mw.notify( "ERROR: " + result.status, { type: 'error' } );
							// args.cancel = true;
							cancelUpdate = 1;
							$gridDiv.jsGrid("updateItem", args.item, args.previousItem );
						}
					}, function errorHandler( jqXHR, textStatus, errorThrown ){
						// args.cancel = true;
						var result = jQuery.parseJSON(jqXHR.responseText);
						var text = result.responseText;

						for ( var i = 0; i < result.errors.length; i++ ) {
							text += ' ' + result.errors[i].message;
						}
						mw.notify( "ERROR: " + text, { type: 'error' } );
						cancelUpdate = 1;
						$gridDiv.jsGrid("updateItem", args.item, args.previousItem );
					} );
				}
			},

			onItemInserting: function( args ){
				if ( editMultiplePages === undefined ) {
					return;
				}

				if ( args.item.page === "" ) {
					mw.notify( "ERROR: " + "Page name not specified", { type: 'error' } );
					args.cancel = true;
					return;
				}

				new mw.Api().get( {
					action: "query",
					titles: [ args.item.page ],
				} ).then( function( ret ) {
					$.each( ret.query.pages, function() {
						if ( this.missing === "" ) {
							$.when( addPage( args ) ).then( function successHandler( result ){
								if ( result.status === 200 ) {
									mw.notify( 'New page: ' + args.item.page + ' created successfully' );
								} else {
									mw.notify( "ERROR: " + result.status, { type: 'error' } );
									// args.cancel = true;
									$gridDiv.jsGrid("deleteItem", args.item );
								}
							}, function errorHandler( jqXHR, textStatus, errorThrown ){
								// args.cancel = true;
								var result = jQuery.parseJSON(jqXHR.responseText);
								var text = result.responseText;

								for ( var i = 0; i < result.errors.length; i++ ) {
									text += ' ' + result.errors[i].message;
								}
								mw.notify( "ERROR: " + text, { type: 'error' } );
								$gridDiv.jsGrid("deleteItem", args.item );
							} );
						} else {
							mw.notify( "ERROR: " + "Page already exists", { type: 'error' } );
							// args.cancel = true;
							$gridDiv.jsGrid("deleteItem", args.item );
						}
					} );
				}, function( error ) {
					mw.notify( "ERROR: " + error, { type: 'error' } );
					// args.cancel = true;
					$gridDiv.jsGrid("deleteItem", args.item );
				} );

			}
		});



		var $gridData = $gridDiv.find( ".jsgrid-grid-body tbody" );

		// Copied from http://js-grid.com/demos/rows-reordering.html
		if ( editMultiplePages === undefined ) {
			$gridData.sortable({
				update: function( e, ui ) {
					// array of indexes
					var clientIndexRegExp = /\s+client-(\d+)\s+/;
					var indexes = $.map( $gridData.sortable( "toArray", { attribute: "class" } ), function(classes) {
						return clientIndexRegExp.exec(classes)[1];
					});

					// arrays of items
					var items = $.map( $gridData.find("tr"), function(row) {
						return $(row).data("JSGridItem");
					});
				}
			});
		}
	});

	$( "#pfForm" ).submit(function( event ) {
		var gridParams = mw.config.get( 'wgPageFormsGridParams' );

		// Add a hidden field for each value in the grid.
		$( "div.jsgrid-grid-body" ).each( function() {
			var $grid = $( this );
			var $gridDiv = $grid.parents( '.jsgrid' );
			var templateName = $gridDiv.attr( 'data-template-name' );

			var rowNum = 1;
			$grid.find( "tr" ).each( function() {
				var $row = $( this );
				if ( $row.hasClass( 'jsgrid-edit-row' ) || $row.hasClass( 'jsgrid-nodata-row' ) ) {
					// Continue.
					return;
				}
				var cellNum = 1;
				$row.find( "td" ).each( function() {
					var paramName = gridParams[templateName][cellNum - 1].name;
					var value = $( this ).html();
					// If this isn't a checkbox, the value
					// will be neither true not false - it
					// will be undefined.
					var isChecked = $( this ).find( ':checkbox' ).prop( 'checked' );
					if ( isChecked === true ) {
						value = mw.config.get( 'wgPageFormsContLangYes' );
					} else if ( isChecked === false ) {
						value = mw.config.get( 'wgPageFormsContLangNo' );
					}
					var inputName = templateName + '[' + rowNum + '][' + paramName + ']';
					$('<input>').attr( 'type', 'hidden' ).attr( 'name', inputName ).attr( 'value', value ).appendTo( '#pfForm' );
					cellNum++;
					if ( cellNum > gridParams[templateName].length ) {
						// Break.
						return false;
					}
				});
				rowNum++;
			});
		});
	});

	$.fn.addNewlineAtCursor = function() {
		var curPos = $(this).getCursorPosition();
		var curVal = $(this).val();
		$(this).val( curVal.substring( 0, curPos ) + "\n" + curVal.substring( curPos ) );
		$(this).setCursorPosition( curPos + 1 );
	};

	// Copied from http://stackoverflow.com/a/1909997
	$.fn.getCursorPosition = function() {
		var el = $(this).get(0);
		var pos = 0;
		if ( 'selectionStart' in el ) {
			pos = el.selectionStart;
		} else if ( 'selection' in document ) {
			el.focus();
			var Sel = document.selection.createRange();
			var SelLength = document.selection.createRange().text.length;
			Sel.moveStart( 'character', -el.value.length );
			pos = Sel.text.length - SelLength;
		}
		return pos;
	};

	// Copied from http://stackoverflow.com/a/3651232
	$.fn.setCursorPosition = function( pos ) {
		this.each( function( index, elem ) {
			if ( elem.setSelectionRange ) {
				elem.setSelectionRange( pos, pos );
			} else if ( elem.createTextRange ) {
				var range = elem.createTextRange();
				range.collapse( true );
				range.moveEnd( 'character', pos );
				range.moveStart( 'character', pos );
				range.select();
			}
		});
		return this;
	};

}( jQuery, mediaWiki, pf ) );