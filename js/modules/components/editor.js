class Editor extends BaseEditor {
  constructor (element, controls) {
    super(element, controls);

    this.element.addEventListener('keydown', this.$preProcessInput.bind(this));
    this.element.addEventListener('input', this.log.bind(this));
  }

  $isLast(selection, offset) {
    var focusOffset = offset || selection.focusOffset;

    return focusOffset === selection.focusNode.length && !selection.focusNode.nextSibling;
  }

  $preProcessInput(e) {
    var selection = window.getSelection();

    if (e.keyCode === 46) { // 'Delete'
      var data = selection.focusNode.data || selection.focusNode.innerHTML;
      data = data.substr(selection.focusOffset - 1);

      if (this.$isLast(selection, selection.focusOffset + 1) && 
          data[1] !== '\n' && data[0] === '\n' && data.length === 2) {
        e.preventDefault();

        selection.collapse(selection.focusNode, selection.focusOffset);
        selection.extend(selection.focusNode,selection.focusOffset + 1);
        document.execCommand('insertHTML', false, '\n');
      }
    }

    if (e.keyCode === 8) { // 'Backspace'
      var last = this.$isLast(selection, Math.max(selection.focusOffset, selection.baseOffset));
      var data = selection.focusNode.innerHTML || selection.focusNode.data;
      var length = Math.abs(selection.focusOffset - selection.baseOffset);
      var index = Math.min(selection.focusOffset, selection.baseOffset);

      if (!length) {
        index = Math.max(0, index - 1);
      }

      if (data) {
        console.log({
          'last': last,
          'current': data[index],
          'prev': data[Math.max(0, (index - 1))],
        });
      } else {
        console.log('Empty')
      }

      if (data && last && data[index] !== '\n' && data[Math.max(0, (index - 1))] === '\n') {
        if (!length) {
          selection.collapse(selection.focusNode, index + 1);
          selection.extend(selection.focusNode, index);
        }
        document.execCommand('insertHTML', false, '\n');
      } else {
        document.execCommand('delete', false);
      }

      e.preventDefault();
    }

    // if (e.keyCode === 8) { // 'Backspace'
    //   var last = this.$isLast(selection, Math.max(selection.focusOffset, selection.baseOffset));
    //   var length = Math.abs(selection.focusOffset - selection.baseOffset);

    //   var index = Math.max(0, Math.min(selection.focusOffset, selection.baseOffset) - 1);
    //   var data = selection.focusNode.innerHTML || selection.focusNode.data;

    //   // console.log({
    //   //   'current': data[data.length - 1],
    //   //   'prev': data[data.length - 2],
        
    //   //   'n.current': data[index],
    //   //   'n.prev': data[Math.max(0, (index - 1))],
    //   //   'index': index,
    //   //   // 'first': Math.max(0, (index - 1)),
    //   // });

    //   e.preventDefault();

    //   if (data) {
    //     console.log({
    //       'last': last,
    //       'current': data[index],
    //       'prev': data[Math.max(0, (index - 1))],
    //     });
    //   } else {
    //     console.log('Empty')
    //   }

      

    //   if (data && last && data[index] !== '\n' && data[Math.max(0, (index - 1))] === '\n') {
    //     // if (!length) {
    //       console.log('select');
    //       selection.collapse(selection.focusNode, index + 1);
    //       selection.extend(selection.focusNode, index);
    //     // }
    //     // document.execCommand('insertHTML', false, '\n');
    //   } else {
    //     // document.execCommand('delete', false);
    //   }

    //   // if (last && data.length > 1 && data[data.length - 1] !== '\n' && data[data.length - 2] === '\n') {
    //   //   selection.collapse(selection.focusNode, data.length);
    //   //   selection.extend(selection.focusNode, data.length - 1 );
    //   //   document.execCommand('insertHTML', false, '\n');
    //   // } else {
    //   //   document.execCommand('delete', false);
    //   // }
    // }

    if (e.keyCode === 13) { // 'Enter'
      var last = this.$isLast(selection, Math.max(selection.focusOffset, selection.baseOffset));

      e.preventDefault();
      return document.execCommand('insertHTML', false, last? '\n\n' : '\n');
    }
  }


  log() {

    // if (selection.focusNode === this.element) {
      // console.log('log.removeChild2');
      
      // var children = this.element.children;

      // for(let i = 0; i < children.length; i++) {
      //   const item = children[i];

      //   if (item.nodeName === 'BR') {
      //     console.log(item)
      //     this.element.removeChild(item);
      //     // this.log()
      //   }
      // }

    // }


    var tagRegex = /(&lt\;\/?[^&]+&gt\;)/ig;
    var symbRegex = /(&amp\;\w+\;)/ig;
    var logDiv = document.getElementById('expression');
    var tagsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };

    let encodedStr = this.element.innerHTML.replace(/[&<>]/g, function (tag) {
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

    // console.log({
    //   'encodedStr': encodedStr.replace(tagRegex, '<span class="error">$1</span>')
    // });
    var logDiv = document.getElementById('expression-result').innerHTML = `<i>html tags: - <b>${(tags && tags.length) || 0};</b></i>&nbsp;&nbsp;&nbsp;<i>symbols: - <b>${(sTags && sTags.length || 0)};</b></i>`;
  }

  $onChange() {}
}


