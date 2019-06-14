class Editor {
  constructor (element, controls) {
    const allowedTags = ['a', 'b', 'i', 'u', 'strong', 'br', 'strike'];
    const allowedAttributes = ['href', 'style'];

    this.element = element;
    this.controls = controls;
    this.rules = [];

    // Replace to <br/>
    // this.rules.push({
    //   pattern: new RegExp('<\/(li|p|h[0-9])>', 'gi'),
    //   replacement: '<br/>'
    // });

    // // Remove all attributes except allowed.
    // --------------------------------------------------
    var replacements = ['$1'];
    var attrPatterns = [];

    for(var i = 0; i < allowedAttributes.length; i++){
      replacements.push('$' + (i + 2));

      attrPatterns.push(
          '(?:(?:(?:(?!' + allowedAttributes.join('=|') + '=)[^>]))*((?:' + 
          allowedAttributes.join('|') + ')=[\'"][^\'"]*[\'"])?)\\s*'
      );
    }

    this.rules.push({
      pattern: new RegExp('<(\\w+)\\s*' + attrPatterns.join('') + '[^>]*>', 'gi'),
      replacement: '<' + replacements.join(' ') + '>'
    });
    // --------------------------------------------------

    // this is a test and <b>Bold</b> and <b style="color: red;">Red-bold</b> and <strike>Strike</strike> < b>Bold2</b> < b>Bold3</ b> < b>Bold3< / b> 
    // (<\s?(a|b|i|u|strong|br|strike)\s?>)
    // (\s?[^>]{0,}class="[^<>"']*"[^>]{0,})
    // (<\s?(a|b(\s?[^>]{0,}class="[^<>"']+"[^>]{0,})?|i|u|strong|br|strike)>)

    // (<\s?(a|b)\s?[^>]*(class|href="[^<>"']*")[^>]{0,}\s?>) - with attributes

    // (<\s?(a|b)\s?[^>]*((class|href)="[^<>"']*")[^>]{0,}\s?>)
    //<(\w+)[^<>]*((?:href)="[^'"]*")[^<>]*>
    
    // Remove all tags except allowed.
    // https://www.regextester.com/93930
    this.rules.push({
      // pattern: new RegExp('((<)\\s?(a|b|i|u|strong|br|strike)([^<>]*)(>)([^<>]*)(<[^<>]*(\/)[^<>]*>))', 'igm'),
      pattern: /((<)\s?(\/?)\s?(a|b|i|u|strong|br|strike)\s*((>)|(\s[^>]+)(>)))/igm,
      pattern: /((<)\s?(\/?)\s?(a|b|i|u|strong|br|strike)\s*(>|\s[^>]+\s*>))/igm,
      replacement: '$2$3$4$5'
    });


    // this.rules.push({
    //   // pattern: new RegExp('(<\/?(?:' + allowedTags.join('|') + ')[^>]*>)|<[^>]+>', 'gi'),
    //   // pattern: new RegExp('(<\s?(\/?)\s?(a|b|i|u|strong|br|strike)(>|\s[^>]+>))', 'igm'),
    //   pattern: /(<\s?(\/?)\s?(a|b|i|u|strong|br|strike)(>|(\s[^>]+)>))/igm,
    //   // pattern: new RegExp('(<?(?:a|b|i|u|strong|br|strike)>)([^<>]+<\/)|(<?(?:a|b|i|u|strong|br|strike)\\s[^>]+>)([^<>]+<\/)|<[^>]+>', 'igm'),
    //   // pattern: new RegExp('((<(?:a|b|i|u|strong|br|strike)>)|(<(?:a|b|i|u|strong|br|strike)\s[^>]*>))([^<>]+)', 'igm'),
    //   replacement: '<$2$3$5>'
    // ((<)\s?(a|b|i|u|strong|br|strike)([^<>]*)(>)([^<>]*)(<[^<>]*(\/)[^<>]*>))
    // $2$3$4$5$6 - $2$8$3$4$5
    // });

    // // Add tab space
    // this.rules.push({
    //   pattern: '\t',
    //   replacement: '<span style="white-space:pre">\t</span>'
    // });

    this.init();

    // Add events
    this.element.addEventListener('paste', this.$onPaste.bind(this));
    this.element.addEventListener('keydown', this.$onHandleInput.bind(this));

    return this.element;
  }

  init() {
    //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
    //https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
    //https://bear.app/

    for (let i = 0; i < this.controls.length; i++) {
      const item = this.controls[i];

      item.onmousedown = this.precommand;
      item.onmouseup = this.command;
    }
  }

  precommand(e) {
    // cancel paste.
    e.preventDefault();
  }

  command(e) {
    let action = this.getAttribute('action');

    // cancel event.
    e.preventDefault();

    console.log(`action: ${action}`);
    document.execCommand(action);
  }

  $onPaste(e) {
    var clipboard = (e.originalEvent || e).clipboardData;
    var data = clipboard.getData('text/html') || clipboard.getData('text/plain');
    // var data = clipboard.getData('text/html');

    var logs = [];
    logs.push(`     ${data}`)

    if (data) {
      // cancel paste.
      e.preventDefault();

      for (let index = 0; index < this.rules.length; index++) {
        const rule = this.rules[index];
        data = data.replace(rule.pattern, rule.replacement);

        // console.log(`${rule.pattern}\n ${rule.replacement}`);
        // console.log(`     ${data}`);

        logs.push(`     ${data}`)
      }


      for(let i = 0; i < logs.length; i++) {
        console.log('----------');
        console.log(logs[i]);
      }

      
      // document.execCommand('insertHTML', false, data);
    }
  }

  $onHandleInput(e) {
    if (e.key === 'Tab') {
      var selection = window.getSelection();
      // var selectionLength = selection.extentOffset - selection.anchorOffset;
      var selectionLines = selection.getRangeAt(0).getClientRects().length;

      e.preventDefault();

      if(selectionLines > 1) {
        document.execCommand(e.shiftKey && 'outdent' || 'indent', true, null);
      } else {
        document.execCommand(e.shiftKey && 'delete' || 'insertText', true, '\t');
      }
    }
  }
}

