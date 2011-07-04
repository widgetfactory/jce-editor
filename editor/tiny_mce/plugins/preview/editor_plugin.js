/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var each = tinymce.each;
	tinymce.create('tinymce.plugins.Preview', {
		init : function(ed, url) {
			var t = this, DOM = tinymce.DOM;

			t.editor = ed, t.url = url;
			
			this.state = false;
			this.active = [];

			ed.addCommand('mcePreview', function() {
				t._togglePreview();
			});
			
			ed.onBeforeExecCommand.add(function(ed, cmd, ui, v, o) {
				if (cmd == 'mcePrint') {
					if (t.state) {
						o.terminate = true;
						var preview = DOM.get(ed.id + '_preview_iframe');
						
						if (preview) {
							preview.contentWindow.print();
						}
					}
				}
			});
			
			ed.onSetContent.add(function(ed, o) {
            	if (t.getState()) {
                    t._disable();                 
                }
            });
			
			ed.onExecCommand.add(function(ed, cmd) {
				switch (cmd) {
					case 'mcePreview' :
						window.setTimeout(function() {
							t._disable();
						}, 0);
						break;
					case 'mceFullScreen' :
						if (t.getState()) {
							window.setTimeout(function() {
								t._disable();
							}, 0);

							var fs = ed.plugins.fullscreen;								
							var w = fs.getWidth(), h = fs.getHeight();
							t.resize(w, h);
						}
						break;
				}
			});
			
			ed.onNodeChange.add( function(ed, cm, n) {
                var s = t.getState();
                
                if (s) {
                	t._disable();
                }
            });

			ed.addButton('preview', {title : 'preview.preview_desc', cmd : 'mcePreview'});
			
			// add theme resize
            ed.theme.onResize.add(function() {
            	if (t.state) {
            		t.resize();
            	}
            });
		},
		
		getState : function() {
			return this.state;
		},
		
		setState : function(s) {
			this.state = s;
		},
		
		resize : function(w, h) {
			var t = this, ed = this.editor, DOM = tinymce.DOM, ifr = DOM.get(ed.id + '_ifr');
			
			w = parseFloat(w) || parseFloat(DOM.getStyle(ifr, 'width'));
			h = parseFloat(h) || parseFloat(DOM.getStyle(ifr, 'height'));

			DOM.setStyles(DOM.get(ed.id + '_preview_iframe'), {
				'width' 	: w,
				'height' 	: h
			});
		},
		
		_disable : function() {
        	var t = this;
        	window.setTimeout( function() {
				t._toggleDisabled();
            }, 0);
        },
		
		/**
		 * Disables all buttons except Preview
		 */
		_toggleDisabled : function() {
			var ed = this.editor, DOM = tinymce.DOM, cm = ed.controlManager;
			
			var state 	= this.getState();
			var toolbar = DOM.get(ed.id + '_toolbargroup');
			
			// store active buttons
			this.active = DOM.select('.mceButtonActive', toolbar);
			
			each(DOM.select('.mceButton, .mceListBox, .mceSplitButton', toolbar), function(n) {
				cm.setDisabled(n.id, state);
				cm.setActive(n.id, false);
			});
			
			if (!state) {
				each (this.active, function(n) {
					cm.setActive(n.id, true);
				});
			}
			
			cm.setActive('preview', state);
			
			cm.setActive('fullscreen', DOM.hasClass(ed.getContainer(), 'fullscreen'));
			
			cm.setDisabled('preview', false);
			cm.setDisabled('print', false);
			cm.setDisabled('fullscreen', false);
		},
		
		_togglePreview : function(state) {
			var t = this, ed = this.editor, DOM = tinymce.DOM;
			
			var state = this.getState();

			var iframe 		= DOM.get(ed.id + '_ifr');
			var preview 	= DOM.get(ed.id + '_preview_iframe');
			
			var container 	= DOM.get(ed.id + '_preview_container');
			var toolbar 	= DOM.get(ed.id + '_toolbargroup');

			var w = parseFloat(iframe.clientWidth);
			var h = parseFloat(iframe.clientHeight);
			
			// Path
            var editorpath 	= DOM.get(ed.id + '_path_row');
            // Word Count
            var wordcount 	= DOM.get(ed.id + '-word-count');

			if (!state) {
				ed.setProgressState(true);
				
				if (!container) {
					container = DOM.create('div', {
						id : ed.id + '_preview_container',
						role : 'application',
						style : {
							position : 'absolute',
							top		 : toolbar.parentNode.clientHeight + 5
						}
					});
					
					var parent = iframe.parentNode;
					parent.insertBefore(container, iframe);
				}
				
				if (!preview) {
					// create iframe
					preview = DOM.add(container, 'iframe', {
		                frameborder	: 0,
		                src			: 'javascript:""',
		                id			: ed.id + '_preview_iframe'
		            });

		            var html = '<html><head xmlns="http://www.w3.org/1999/xhtml">';
		            html += '<base href="' + tinymce.settings['document_base_url'] + '" />';
		            html += '<meta http-equiv="X-UA-Compatible" content="IE=7" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

		            // get css
		            var css = tinymce.explode(ed.getParam('content_css'));
					
					// insert css
		            html += '<link href="' + t.url + '/css/preview.css" rel="stylesheet" type="text/css" />';
		            
		            tinymce.each(css, function(url) {
		            	html += '<link href="' + url + '" rel="stylesheet" type="text/css" />';
		            });

		            html += '</head><body style="margin:5px;">';
		            html += '</body></html>';
		            
		            var doc = preview.contentWindow.document;

		            doc.open();
		            doc.write(html);
		            doc.close();
				}
				
				DOM.setStyles(preview, {
					width : w,
					height : h
				});
				
				// hide Path                
                if (editorpath) {
                	DOM.hide(editorpath);
                } 
                // hide word count                
                if (wordcount) {
                	DOM.hide(wordcount.parentNode);
                }
				
				t._loadData(preview);
				
				DOM.setStyle(iframe, 'hidden');
				DOM.setAttrib(iframe, 'aria-hidden', true);
				
				DOM.show(container);
				container.removeAttribute('aria-hidden');
				
			} else {
				// show Path                
                if (editorpath) {
                	DOM.show(editorpath);
                } 
                // show word count                
                if (wordcount) {
                	DOM.show(wordcount.parentNode);
                }
				
				var doc = preview.contentWindow.document;
				doc.body.innerHTML = '';
				
				DOM.removeClass(iframe, 'hidden');
            	iframe.removeAttribute('aria-hidden');
            	
				DOM.hide(container);
				DOM.setAttrib(container, 'aria-hidden', true);
			}

			this.setState(!state);
		},
		
		_loadData : function(n) {
			var t = this, ed = this.editor, s = tinymce.settings, doc = n.contentWindow.document;
			
			var query = '', args = {'format' : 'json'};
			
			// add token
			var token = document.getElementById('wf_' + ed.id + '_token');
			
			if (!token) {
				alert('INVALID TOKEN');
				return false;
			}
			
			args[token.name] = token.value;
			
			tinymce.extend(args, {
				'data' : ed.getContent()
			});
			
			// create query
			for (k in args) {
				query += '&' + k + '=' + encodeURIComponent(args[k]);
			}
			
			// load preview data
			tinymce.util.XHR.send({
				url 	: s['site_url'] + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=preview&component_id=' + s['component_id'],
				data 	: 'json=' + tinymce.util.JSON.serialize({'fn' : 'showPreview'}) + '&' + query,
				content_type : 'application/x-www-form-urlencoded',
				success : function(x) {
					// Logic borrowed from http://json.org - https://github.com/douglascrockford/JSON-js
	            	if (/^[\],:{}\s]*$/
	                    .test(x.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
	                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
	                	 o = tinymce.util.JSON.parse(x);
	                } else {
	                	o = {
	                        error : 'Invalid JSON: ' + x
	                    };
	                }
				
					if (o.error) {
						ed.windowManager.alert(o.text.join(''));
						ed.setProgressState(false);
						return false;
					}
	
					r = o.result;

					doc.body.innerHTML = r;
					ed.setProgressState(false);
				},
				error 	: function(e, x) {
					doc.body.innerHTML = ed.getContent();			
					ed.setProgressState(false);
				}
			});
		},

		getInfo : function() {
			return {
				longname : 'Preview',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/preview',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('preview', tinymce.plugins.Preview);
})();