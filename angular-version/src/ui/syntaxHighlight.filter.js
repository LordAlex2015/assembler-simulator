app.filter('syntaxHighlight', ['$log','$sce',function($log, $sce) {
    return function(input) {
        if (!input) return '';
        // Escape HTML to avoid XSS and rendering issues.
        var escaped = input.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Store comments and strings
        var commentMatches = [];
        var stringMatches = [];

        // Extract and replace comments with placeholders
        escaped = escaped.replace(/(;.*)$/gm, function(match) {
            var id = 'COMMENT_' + commentMatches.length;
            commentMatches.push({id: id, text: match});
            return id;
        });

        // Extract and replace strings with placeholders
        escaped = escaped.replace(/"([^"]*)"/g, function(match) {
            var id = 'STRING_' + stringMatches.length;
            stringMatches.push({id: id, text: match});
            return id;
        });

        // Now highlight numbers in the clean code
        escaped = escaped.replace(/\b\d+\b/g, '<span class="num">$&</span>');

        // Highlight hexadecimal values
        escaped = escaped.replace(/0x[0-9A-Fa-f]+/g, '<span class="hexa">$&</span>');

        // Highlight addresses
        escaped = escaped.replace(/\[([^\]]+)\]/g, '<span class="addr">[$1]</span>');

        // Function keywords
        escaped = escaped.replace(/(MOV|ADD|SUB|INC|DEC|CMP|JMP|JC|JNC|JZ|JNZ|JA|JNA|PUSH|POP|CALL|RET|MUL|DIV|AND|OR|XOR|NOT|SHL|SHR|HLT|DB)/g,
            '<span class="function">$1</span>');

        // Variables/labels
        escaped = escaped.replace(/^\s*([A-Za-z_\.][A-Za-z0-9_\.]*)\s*:/gm,
            '<span class="var">$1:</span>');

        // Restore strings with highlighting
        stringMatches.forEach(function(item) {
            escaped = escaped.replace(item.id, '<span class="string">' + item.text + '</span>');
        });

        // Restore comments with highlighting
        commentMatches.forEach(function(item) {
            escaped = escaped.replace(item.id, '<span class="comment">' + item.text + '</span>');
        });

        return $sce.trustAsHtml(escaped);
    };
}]);