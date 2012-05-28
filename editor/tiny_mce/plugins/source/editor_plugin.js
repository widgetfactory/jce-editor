/**
 * @copyright   @@copyright@@
 * @author		Ryan Demmer
 * @license     @@licence@@
 * JCE is free software. This version may have been modified
 * pursuant to the GNU General Public License, and as distributed it
 * includes or is derivative of works licensed under the GNU General
 * Public License or other free or open source software licenses.
 */

(function() {
    var each = tinymce.each;
    
    tinymce.create('tinymce.plugins.Source', {
        init : function(ed, url) {
            var self = this;

            this.editor = ed; 
            this.url = url;

            // add command
            ed.addCommand('mceSource', function() {
                self.toggleSource();
            });
            
            this.invisibles = false;

            // add context menu blocker
            if (ed.onContextMenu) {
                var cMenu = ed.onContextMenu.addToTop( function(ed, e) {
                    if (ed.plugins.source.state) {
                        return false;
                    }
                });
            }
            
            ed.onInit.add(function() {
                var s = ed.getParam('source_state', false);
            		
                if (typeof s != 'undefined') {
                    ed.settings.source_state = !s;
                    self.toggleSource();
                }    
            	
                if (ed.plugins.fullscreen) {
                    ed.onFullScreen.add(function(state, settings) {                                                

                        if (!state) {
                            ed.settings.source_state = !settings.source_state;
		            		
                            each(['source_highlight', 'source_numbers', 'source_wrap'], function(s) {
                                ed.settings[s] = settings[s];
                            });

                            self.toggleSource();
                        }
                    });
                }      		
            });

            // Patch in Commands
            ed.onBeforeExecCommand.add( function(ed, cmd, ui, val, o) {
                var cm = ed.controlManager, se = self.getEditor();

                if (self.state && se) {
                    switch(cmd) {
                        case 'Undo':
                            o.terminate = true;
                            se.undo();
                            cm.setDisabled('redo', false);
                            return true;
                            break;
                        case 'Redo':
                            o.terminate = true;
                            se.redo();
                            cm.setDisabled('redo', true);
                            return true;
                            break;
                        case 'mcePrint':
                            o.terminate = true;
                            return self.printSource();
                            break;
                        case 'mceFullScreen':
                            if (self.getState()) {                            
                                ed.setContent(self.getContent());
                            }
                            break;
                    }
                }
            });

            ed.onLoadContent.add( function(ed, o) {
                if (self.getState()) {
                    self._disable();
                    self.setContent();                   
                }
            });
            
            ed.onSetContent.add(function(ed, o) {
                if (self.getState()) {
                    self.setContent(); 
                    self._disable();               
                }
            });

            ed.onSaveContent.add( function(ed, o) {
                if (self.getState()) {
                    o.content = self.getContent();
                }
            });

            ed.onExecCommand.add( function(ed, cmd, ui, v, o) {
                switch (cmd) {
                    case 'mceCodeEditor':
                    case 'mceSource' :
                        self._disable();

                        break;
                    case 'mceFullScreen' :
                        break;
                    case 'mceInsertContent' :
                        if (self.getState()) {
                            o.terminate = true;

                            self._disable();

                            self.insertContent(v);
                        }
                        break;
                }
            });

            ed.addButton('source', {
                title : 'source.source_desc',
                cmd : 'mceSource'
            });

            ed.addButton('wrap', {
                title : 'source.wrap_desc',
                onclick : function() {
                    self.setWrap(!ed.getParam('source_wrap', true));
                    return true;
                }

            });

            ed.addButton('highlight', {
                title : 'source.highlight_desc',
                onclick : function() {
                    self.setHighlight(!ed.getParam('source_highlight', true));
                    return true;
                }

            });

            ed.addButton('numbers', {
                title : 'source.numbers_desc',
                onclick : function() {
                    self.setNumbers(!ed.getParam('source_numbers', true));
                    return true;
                }

            });

            ed.onNodeChange.add( function(ed, cm, n) {
                var s = self.getState();
                
                if (s) {
                    self._disable();
                }
                
                each(['wrap', 'highlight', 'numbers'], function(e) {
                    cm.setDisabled(e, !s);
                });
            });

            // add theme resize
            ed.theme.onResize.add( function() {
                self.resize();
            });

        },
        
        _disable : function() {
            var self = this;
            window.setTimeout( function() {
                self.toggleDisabled();
            }, 0);
        },
        
        getWin : function() {
            var ed = this.editor, f = tinymce.DOM.get('wf_'+ ed.id +'_source_iframe');
        	
            if (f) {
                return f.contentWindow;
            }
        	
            return false;	
        },
        
        getDoc : function() {
            var w = this.getWin();
        	
            if (w) {
                return w.document;
            }
        	
            return false;
        },
        
        getContainer : function() {
            var se = this.getEditor();
        	
            if (se) {
                return se.getContainer();
            }
        	
            return null;
        },
        
        getEditor : function() {
            var win = this.getWin();
        	
            if (win) {
                return win.SourceEditor || null;
            }
        	
            return null;
        },

        getState : function() {
            return this.editor.getParam('source_state', false);;
        },

        setState : function(s) {
            this.state = s;
        },

        getTop : function() {
            var ed = this.editor, container = ed.getContentAreaContainer();
            return container.offsetTop + Math.round((container.offsetHeight - container.clientHeight) / 2);
        },

        printSource : function() {},
        
        reInit : function() {
            this.toggleDisabled(), se = this.getEditor();
        	
            if (this.getState() && se) {
                se.focus();
            }
        },

        setContent : function(v) {
            var ed = this.editor, se = this.getEditor();

            if (typeof v == 'undefined') {
                v = ed.getContent();
            }

            if (se) {                
                // decode and indent
                v = this.indent(v);
                
                se.setContent(v);
            }
        },
        
        insertContent : function(v) {
            var DOM = tinymce.DOM, se = this.getEditor();
        	
            if (se) {                
                // decode and indent
                v = this.indent(DOM.decode(v));
                
                se.insertContent(v);
            }
        },

        getContent : function() {
            var se = this.getEditor();

            if (se) {
                return se.getContent();
            }
        },

        resize : function(w, h) {
            if (!this.state)
                return;

            var ed = this.editor, DOM = tinymce.DOM, ifr = DOM.get(ed.id + '_ifr'), se = this.getEditor();

            w = parseFloat(w) || ifr.clientWidth;
            h = parseFloat(h) || ifr.clientHeight;

            if (se) {
                DOM.setStyles('wf_' + ed.id + '_source_iframe', {
                    'width' 	: w,
                    'height' 	: h
                });
                
                DOM.setStyles(this.getContainer(), {
                    'width' 	: w,
                    'height' 	: h
                });

                se.resize(w, h);
            }
        },

        /**
         * Disables all buttons except Source
         */
        toggleDisabled : function() {
            var ed = this.editor, DOM = tinymce.DOM, cm = ed.controlManager;

            var state 	= this.getState();
            // store active buttons
            var active 	= DOM.select('.mceButtonActive', DOM.get(ed.id + '_toolbargroup'));

            if (!state) {
                // remove print iframe
                var print = DOM.get(ed.id + '_source_print');
                
                if (print) {
                    DOM.remove(print);
                }

                // set all source buttons inactive
                each(['wrap', 'highlight', 'numbers'], function(e) {
                    cm.setActive(e, false);
                });

            } else {
                // set all source buttons inactive
                each(['wrap', 'highlight', 'numbers'], function(e) {
                    cm.setActive(e, ed.getParam('source_' + e, true));
                });
            }

            each (active, function(n) {
                cm.setActive(n.id, !state);
            });

            each(DOM.select('.mceButton, .mceListBox, .mceSplitButton', DOM.get(ed.id + '_toolbargroup')), function(n) {            	
                var id = n.id;
            	
                // get splitButton id from parent
                if (n.className.indexOf('mceSplitButton') !== -1) {
                    id = n.parentNode.id;
                }
            	
                if (id) {
                    cm.setDisabled(id, state);
                }
            });

            cm.setActive('source', state);
            cm.setActive('fullscreen', (ed.id == 'mce_fullscreen'));

            cm.setDisabled('source', false);
            cm.setDisabled('fullscreen', false);

            each(['wrap', 'highlight', 'numbers'], function(e) {
                cm.setDisabled(e, !state);
            });
        },

        toggleSource : function() {
            var self = this, ed = this.editor, DOM = tinymce.DOM, cm = ed.controlManager;
            var se = this.getEditor();

            var state = this.getState();

            // editor iframe
            var iframe 		= DOM.get(ed.id + '_ifr');

            // set the state
            this.setState(!state);
            
            if (tinymce.isIE) {
                DOM.setStyle(iframe.parentNode, 'position', 'relative');
            }
            
            // Path
            var editorpath 	= DOM.get(ed.id + '_path_row');
            // Word Count
            var wordcount 	= DOM.get(ed.id + '-word-count');

            if (!state) {
                // hide Path
                if (editorpath) {
                    DOM.hide(editorpath);
                } 
                // hide word count
                if (wordcount) {
                    DOM.hide(wordcount.parentNode);
                }
 
                // hide iframe
                DOM.setStyle(iframe, 'visiblity', 'hidden');
                DOM.setAttrib(iframe, 'aria-hidden', true);
                
                window.setTimeout(function() {
                    self.setHighlight(ed.getParam('source_highlight', true));
                    if (se) {
                        se.focus();
                    }
                }, 10);
            } else {
                if (se) {
                    // pass content
                    ed.setContent(self.getContent());
                    
                    DOM.hide('wf_' + ed.id + '_source_container');
                    DOM.setAttrib('wf_' + ed.id + '_source_container', 'aria-hidden', true);
                    
                    se.focus();
                }

                // show iframe
                DOM.setStyle(iframe, 'visiblity', 'visible');
                iframe.removeAttribute('aria-hidden');
                
                // show Path                
                if (editorpath) {
                    DOM.show(editorpath);
                } 
                // show word count                
                if (wordcount) {
                    DOM.show(wordcount.parentNode);
                }
                
                cm.setActive('highlight', false);
                cm.setActive('numbers', false);
                cm.setActive('wrap', false);

                ed.setProgressState(false);
            }
            // store state
            ed.settings.source_state = !state;
        },

        loadEditor : function() {
            var self = this, ed = this.editor, cm = ed.controlManager, DOM = tinymce.DOM, iframe = DOM.get(ed.id + '_ifr');
            var w = iframe.clientWidth, h = iframe.clientHeight;

            // create the container
            var container = DOM.create('div', {
                role	: 'textbox',
                style 	: {
                    position : 'absolute',
                    top		 : tinymce.isIE ? 0 : this.getTop()
                },
                id		: 'wf_' + ed.id + '_source_container',
                'class' : 'WFSourceEditor'
            });

            DOM.insertAfter(container, iframe);

            var query 	= ed.getParam('site_url') + 'index.php?option=com_jce';
            
            var args 	= {
                'view' 		: 'editor',
                'layout'	: 'plugin',
                'plugin'	: 'source',
                'component_id' : ed.getParam('component_id')
            };

            // set token
            args[ed.settings.token] = 1;

            // create query
            for (k in args) {
                query += '&' + k + '=' + encodeURIComponent(args[k]);
            }
            
            var iframe = DOM.create('iframe', {
                'frameborder' 	: 0,
                'scrolling'		: 'no',
                'id'			: 'wf_'+ ed.id +'_source_iframe',
                'src'			: query,
                'style'			: {
                    'width' : w,
                    'height': h 
                }
            });
            
            tinymce.dom.Event.add(iframe, 'load', function() {
                var editor = self.getEditor();
            	
                var v = ed.getContent(), highlight = ed.getParam('source_highlight', true), wrap = ed.getParam('source_wrap', true), numbers = ed.getParam('source_numbers', true);

                editor.init({
                    /*'url'		: ed.getParam('site_url'),
            		'token'		: ed.settings.token,*/
                    'wrap' 		: wrap,
                    'numbers'	: numbers,
                    'highlight'	: highlight,
                    'width'		: w,
                    'height'	: h,
                    'theme' 	: ed.getParam('source_theme', 'textmate'),
                    'load'		: function() {
                        ed.setProgressState(false);
            			
                        if (tinymce.isIE && !document.querySelector) {
                            ed.hide();
                            ed.show();
                        }
                        cm.setActive('highlight', highlight);
                        cm.setActive('numbers', numbers);
                        cm.setActive('wrap', wrap);          			
                    },
                    change : function() {
                        ed.controlManager.setDisabled('undo', false);
                    }
                }, self.indent(v));
            	
                editor.resize('100%', h);
            });
            
            DOM.add(container, iframe);
        },

        /**
         * Simple HTML Indentation
         * @param {String} h HTML string to indent
         */
        indent : function(h) {
            return WFEditor.indent(h);
        },

        /**
         * Toggle Syntax Highlighting editor
         * Will create / show / hide the textarea source editor or ACE editor
         */
        setHighlight : function(s) {
            var ed = this.editor, DOM = tinymce.DOM, cm = ed.controlManager, se = this.getEditor();

            cm.setActive('highlight', !!s);

            if (se) {            	
                se.setHighlight(s);

                this.setContent();
                
                se.indent();
                
                DOM.show('wf_' + ed.id + '_source_container');
                DOM.setAttrib('wf_' + ed.id + '_source_container', 'aria-hidden', false);
                
                this.resize();

                this.setNumbers(ed.getParam('source_numbers', true));
                this.setWrap(ed.getParam('source_wrap', true));

                ed.focus();

                ed.setProgressState(false);
            } else {
                ed.setProgressState(true);
                this.loadEditor();
            }

            ed.settings.source_highlight = !!s;
        },

        /**
         * Set CodeMirror / Textarea word wrapping
         * @param {Object} el Textarea element
         * @param {Boolean} s State
         */
        setWrap: function(s) {
            var ed = this.editor, se = this.getEditor();

            var cm = ed.controlManager;

            ed.settings.source_wrap = !!s;

            cm.setActive('wrap', !!s);

            if (se) {
                se.setWrap(s);
            }

        },

        setNumbers : function(s) {
            var ed = this.editor, cm = ed.controlManager, se = this.getEditor();

            ed.settings.source_numbers = !!s;

            cm.setActive('numbers', !!s);

            if (se) {
                return se.setNumbers(!!s);
            }

        },

        getInfo : function() {
            return {
                longname : 'Source',
                author : 'Ryan Demmer',
                authorurl : 'http://www.joomlacontenteditor.net',
                infourl : 'http://www.joomlacontenteditor.net',
                version : '@@version@@'
            };
        }

    });

    // Register plugin
    tinymce.PluginManager.add('source', tinymce.plugins.Source);
})();