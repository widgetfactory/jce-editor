(function() {
    var tinymce = window.parent.tinymce, DOM = tinymce.DOM, Event = tinymce.dom.Event;
    var SourceEditor = {

        init : function(options, content) {
            var self = this;

            if(Event.domLoaded) {
                self.container = DOM.add(document.body, 'div', {
                    style : {
                        width : options.width || '100%',
                        height : options.height || '100%'
                    },
                    'class' : 'container'
                });

                self._load(options, content);
            } else {
                Event.add(document, 'init', function() {
                    self.init(options, content);
                });
            }

        },
        _load : function(o, content) {
            var self = this, ed;

            o.load = tinymce.is(o.load, 'function') ? o.load : function() {
            };
            o.change = tinymce.is(o.change, 'function') ? o.change : function() {
            };
            if(window.CodeMirror) {
                                
                ed = CodeMirror(this.container, {
                    mode : "text/html",
                    theme : o.theme || 'textmate',
                    onChange : function() {
                        // callback
                        o.change.call();
                    },
                    indentWithTabs : true,
                    smartIndent : true,
                    tabMode: "indent"
                });
                // highlight line
                var hlLine = ed.setLineClass(0, "activeline");

                ed.setWrap = function(s) {
                    ed.setOption('lineWrapping', s);
                };

                ed.showGutter = function(s) {
                    ed.setOption('lineNumbers', s);
                };

                ed.highlight = function(s) {
                    var c = ed.getCursor();

                    if(s) {
                        ed.setOption('mode', 'text/html');
                    } else {
                        ed.setOption('mode', 'text/plain');
                    }

                    ed.setCursor(c);
                };

                ed.resize = function(w, h) {
                    DOM.setStyles(ed.getScrollerElement(), {
                        width : w,
                        height : h
                    });

                    DOM.setStyles(ed.getGutterElement(), {
                        height : h
                    });
                };

                ed.showInvisibles = function(s) {
                };

                ed.setContent = function(v) {
                    if(v === '') {
                        v = '\u00a0';
                    }
                    return ed.setValue(v);
                };

                ed.insertContent = function(v) {
                    return ed.replaceSelection(v);
                };

                ed.getContent = function() {
                    return ed.getValue();
                };

                this.editor = ed;
                this._loaded(o, content);
            }
            
            if (window.ace) {
                var editor = ace.edit(this.container);
                
                editor.getSession().on('change', o.change);
                
                // set mode
                editor.getSession().setMode("ace/mode/html");
                
                editor.indent();
                
                // hide print margin
                editor.setShowPrintMargin(false);
                
                editor.setWrap = function(s) {
                    editor.getSession().setUseWrapMode(s);
                };
                
                editor.showGutter = function(s) {
                    editor.renderer.setShowGutter(s);
                };
                
                editor.highlight = function(s) {
                    if (s) {
                        editor.getSession().setMode("ace/mode/html");
                    } else {
                        editor.getSession().setMode("ace/mode/text");
                    }
                };
                
                editor.insertContent = function(v) {
                    editor.insert(v);
                };
                
                editor.getContent = function() {
                    return editor.getSession().getValue();
                };
                
                editor.setContent = function(v) {
                    return editor.getSession().setValue(v);
                };
                
                editor.showInvisibles = function(v) {};
                
                this.editor = editor;
                this._loaded(o, content);
            }
        },
        _loaded : function(o, content) {
            this.setContent(content);

            // set word wrap
            this.setWrap(!!o.wrap);
            // set line numbers / gutter
            this.setNumbers(!!o.numbers);

            this.focus();

            // callback
            o.load.call();
        },
        setWrap : function(s) {
            return this.editor.setWrap(s);
        },
        setNumbers : function(s) {
            return this.editor.showGutter(s);
        },
        setHighlight : function(s) {
            return this.editor.highlight(s);
        },
        setContent : function(v) {
            return this.editor.setContent(v);
        },
        insertContent : function(v) {
            return this.editor.insertContent(v);
        },
        getContent : function() {
            return this.editor.getContent();
        },
        showInvisibles : function(s) {
            return this.editor.showInvisibles(s);
        },
        resize : function(w, h) {
            return this.editor.resize(w, h);
        },
        focus : function() {
            return this.editor.focus();
        },
        undo : function() {
            return this.editor.undo();
        },
        redo : function() {
            return this.editor.redo();
        },
        indent : function() {
            //return this.editor.reindent();
        },
        getContainer : function() {
            return this.container || null;
        }
    };

    window.SourceEditor = SourceEditor;
}());
