class TextProcessor {
  constructor (element) {
    this.element = element;
    this.$htmlHelper = new HtmlHelper(this.element);
    
    //SWEET STYLES https://support.discordapp.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-
    this.$helpers = {
      link: new LinkAdapter(this.element, code.ctrl + code.l),
      italic: new StyleAdapter(this.element, '*', '<i>${text}</i> ', code.ctrl + code.i),
      bold: new StyleAdapter(this.element, '**', '<b>${text}</b> ', code.ctrl + code.b),
      strikethrough: new StyleAdapter(this.element, '~~', '<strike>${text}</strike> ', code.ctrl + code.y),
      underline: new StyleAdapter(this.element, '__', '<u>${text}</u> ', code.ctrl + code.u),
      
      boldItalic: new StyleAdapter(this.element, '***', '<b><i>${text}</i></b> '),
      underlineItalic: new StyleAdapter(this.element, '__*', '<u><i>${text}</i></u> '),
      underlineBold: new StyleAdapter(this.element, '__**', '<u><b>${text}</b></u> '),
      underlineBoldItalic: new StyleAdapter(this.element, '__***', '<u><b><i>${text}</i></b></u> '),
      
      code: new StyleAdapter(this.element, '`', '<code>${text}</code>'),
      pre: new StyleAdapter(this.element, '```', '<pre>${text}</pre>'),
      quote: new StyleAdapter(this.element, `'''`, '<q>${text}</q>'),
      line: new StyleAdapter(this.element, `---`, '<hr> '),
      
      removeFormat: new StyleRemover(this.element, code.ctrl + code.g),
      insertOrderedList: new CommandAdapter(this.element, code.ctrl + code.o),
      insertUnorderedList: new CommandAdapter(this.element, code.ctrl + code.p),
      
      undo: new CommandAdapter(this.element, code.ctrl + code.z, true),
      redo: new CommandAdapter(this.element, code.ctrl + code.shift + code.z, true)
    };

    this.element.addEventListener('paste', this.$onPaste.bind(this));
    this.element.addEventListener('copy', this.$onCopy.bind(this));
    this.element.addEventListener('cut', this.$onCopy.bind(this));
    this.element.addEventListener('blur', this.$onChange.bind(this));
    this.element.addEventListener('keydown', this.$preProcessInput.bind(this));
    this.element.addEventListener('keyup', this.$postProcessInput.bind(this));

    document.execCommand('defaultParagraphSeparator', false, 'p');
    //#region TEST_DATA
    this.element.addEventListener('input', this.log.bind(this));
    setTimeout(function () {
      this.log();
    }.bind(this), 250)
    //#endregion
  }

  /**
   * Internal method: SetUneditable.
   * 
   * @param {*} tagName
   * Makes all elements not editable/executable by tag name.
   */
  $setUneditable(tagName) {
    const links = this.element.getElementsByTagName(tagName);

    for(let i = 0; i < links.length; i++) {
      links[i].setAttribute('contenteditable', 'false');
    }
  }

  /**
   * Internal method: OnPaste.
   * 
   * @param {*} tagName
   * Removes from elements not editable/executable functionality by tag name.
   */
  $setEditable(tagName) {
    const links = this.element.getElementsByTagName(tagName);

    for(let i = 0; i < links.length; i++) {
      links[i].removeAttribute('contenteditable');
    }
  }

  /**
   * Internal method: SetScrollTop.
   * 
   * @param {*} selection
   * @param {*} scrollTop
   * Moves the scroll to the active element
   */
  $setScrollTop(selection, scrollTop) {
    this.element.parentNode.scrollTop = scrollTop;
    this.element.parentNode.scrollTop = Helper.getScrollTop(this.element, selection, scrollTop);
  }

  /**
   * Internal Event: OnPaste.
   * 
   * @param {*} e
   * Removes html except allowed tags and attributes.
   */
  $onPaste(e) {
    let selection = window.getSelection();
    let scrollTop = this.element.parentNode.scrollTop;
    var clipboard = (e.originalEvent || e).clipboardData;
    let linkRegex = /^(\s*)((https?\:\/\/|www\.)[^\s]+)(\s*)$/i;
    let adapter = new CommandAdapter(this.element);
    let isLocked = adapter.isInside(selection, 'CODE|PRE');
    var text = clipboard.getData('text/plain');
    var html = clipboard.getData('text/html');

    e.preventDefault();

    if(!isLocked && html && !linkRegex.test(text) && 
      (localStorage.allowPasteHtml === true || this.$htmlHelper.isInternalClipboard(html))) {
      document.execCommand('insertHTML', false, this.$htmlHelper.removeHtml(html, text));
      return this.$setScrollTop(selection, scrollTop);
    }

    document.execCommand('insertText', false, text);
    return this.$setScrollTop(selection, scrollTop);
  }

  /**
   * Internal Event: OnCopy.
   * 
   * @param {*} e
   * Fills the clipboardData on copy/cut command.
   */
  $onCopy(e) {
    let selection = window.getSelection();
    let html = this.$htmlHelper.getHtml(selection);

    e.clipboardData.setData('text/plain', selection.toString());
    e.clipboardData.setData('text/html', `<${this.$htmlHelper.tagName}>${html}</${this.$htmlHelper.tagName}>`);

    if (e.type === 'cut') {
      document.execCommand('delete', false);
    }

    e.preventDefault();
  }

  /**
   * Internal event: PreProcessInput.
   * 
   * @param {*} e
   * 
   * Executes before the keyboard input, handels the commands text format.
   */
  $preProcessInput(e) {
    let selection = window.getSelection();
    let textSelected = Math.abs(selection.focusOffset - selection.baseOffset) > 0;
    // let focusNode = selection.focusNode;

    // ctrlKey enables/disables links to be clickable.
    if (e.ctrlKey && e.keyCode === code.ctrlKey && !e.shiftKey) {
      this.$setUneditable('A');
    } else {
      this.$setEditable('A');
    }

    // custom commands
    if (e.ctrlKey && code.sysKeys.indexOf(e.keyCode) < 0) {
      e.preventDefault();

      for(var key in this.$helpers) {
        const helper = this.$helpers[key];

        if (code.uid(e.ctrlKey, e.shiftKey, e.keyCode) === helper.keyCode) {
          return helper.command(key, selection);
        }
      }
    }

    // 'Tab' execute a custom command
    if (!e.ctrlKey && !e.shiftKey && !textSelected && e.keyCode === code.tab) {
      for(var key in this.$helpers) {
        const helper = this.$helpers[key];

        if (helper.test(selection) && helper.exec(selection)) {
          return e.preventDefault();
        }
      }
    } 

    // 'Tab' shifts spaces toward/backward
    if ((e.keyCode === code.tab)) {
      e.preventDefault();
      document.execCommand(e.shiftKey && 'delete' || 'insertHTML', true, '    ');

      // let selectionLines = selection.getRangeAt(0).getClientRects().length;
      // e.preventDefault();

      // if(selectionLines > 1) {
      //   document.execCommand(e.shiftKey && 'outdent' || 'indent', true, null);
      // } else {
      //   // document.execCommand(e.shiftKey && 'delete' || 'insertText', true, '\t');
      //   document.execCommand(e.shiftKey && 'delete' || 'insertHTML', true, '    ');
      // }
    }

    // 'Enter' scrolls to cursor
    if (e.keyCode === code.enter) {
      let scrollTop = this.element.parentNode.scrollTop;

      e.preventDefault();
      document.execCommand('insertText', false, '\n');

      return this.$setScrollTop(selection, scrollTop);
    }
  }

  /**
   * Internal event: PostProcessInput.
   * 
   * @param {*} e
   * 
   * Executes after the keyboard's input, revert beck the commands.
   */
  $postProcessInput(e) {
    this.$shiftKey = false;
    this.$ctrlKey = false;

    this.$setEditable('A');
  }

  /**
   * Internal method: OnChange.
   * 
   * Fires on content blur
   */
  $onChange() {
    return this.$htmlHelper.removeHtml(this.element.innerHTML).replace(/^([ ]*)[\r\n]$/gi, '$1');
  }

  static log(element) {
    var tagRegex = /(&lt\;\/?[^&]+&gt\;)/ig;
    var symbRegex = /(&amp\;\w+\;)/ig;
    var logDiv = document.getElementById('expression');
    var tagsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };

    let encodedStr = element.innerHTML.replace(/[&<>]/g, function (tag) {
      return tagsToReplace[tag] || tag;
    });

    var tags = encodedStr.match(tagRegex);
    var sTags = encodedStr.match(symbRegex);
    
    // logDiv.innerHTML = '"' + encodedStr.replace(/[ ]/ig, '&nbsp;').
    //                          replace(tagRegex, '<span class="error">$1</span>').
    //                          replace(symbRegex, '<span class="html-symbol">$1</span>').
    //                          replace(/(\n|\r)/ig, '<span class="symbol">\\n</span>') + '"';

    logDiv.innerHTML = '"' + encodedStr.replace(tagRegex, '<span class="error">$1</span>').
                                        replace(symbRegex, '<span class="html-symbol">$1</span>').
                                        replace(/( )( )/ig, '$1&nbsp;').
                                        replace(/(\n|\r)/ig, '<span class="symbol">\\n</span>') + '"';

    // var text = this.$toString(this.element.innerHTML);
    // var html = this.$toHtml(text);
    // let encodedtext = text.replace(/[&<>]/g, function (tag) {
    //   return tagsToReplace[tag] || tag;
    // });

    // logDiv.innerHTML += '<hr>'
    // logDiv.innerHTML += encodedtext.replace(tagRegex, '<span class="error">$1</span>').
    //                               replace(symbRegex, '<span class="html-symbol">$1</span>').
    //                               replace(/( )( )/ig, '$1&nbsp;').
    //                               replace(/(\n|\r)/ig, '<span class="symbol">\\n</span>').replace(/ /gi, '&nbsp;') + '"';
    
    // var code = document.createElement('pre')
    // code.innerHTML = '<hr>' + html;
    // logDiv.appendChild(code);


    // var source = document.createElement('div');
    // let encodedSource = html.replace(/[&<>]/g, function (tag) {
    //   return tagsToReplace[tag] || tag;
    // });

    // source.innerHTML += '<hr>'
    // source.innerHTML += encodedSource.replace(tagRegex, '<span class="error">$1</span>').
    //                               replace(symbRegex, '<span class="html-symbol">$1</span>').
    //                               replace(/( )( )/ig, '$1&nbsp;').
    //                               replace(/(\n|\r)/ig, '<span class="symbol">\\n</span>') + '"';

    // logDiv.appendChild(source);

    // console.log({
    //   'encodedStr': encodedStr.replace(tagRegex, '<span class="error">$1</span>')
    // });
    var logDiv = document.getElementById('expression-result').innerHTML = 
      `<i>html tags: - <b>${(tags && tags.length) || 0};</b></i>&nbsp;&nbsp;&nbsp;<i>symbols: - <b>${(sTags && sTags.length || 0)};</b></i>`;
  }
}

var print = function (value, color) {

  // console.log(`%c ${new Array(210).join('-')}`, 'background: transparent; color: silver');
  console.log();

  if(color) {
    if(typeof value === 'object') {
      console.log(`%c ${value.join? `[${value.join('|')}]` : JSON.stringify(value)}`, `background: transparent; color: ${color};`);
    } else {
      console.log(`%c ${value}`, `background: transparent; color: ${color};`);
    }
  } else {
    console.log(value);
  }
};