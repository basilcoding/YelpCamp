// why jquery is used:
// Shorthand Syntax: It offers a much more concise way to write JavaScript for DOM manipulation and event handling compared to raw, vanilla JavaScript (especially before modern ES6 features like querySelector and addEventListener became widely adopted and well-supported).
// Vanilla JS: document.getElementById('myButton').addEventListener('click', function() { ... });
// jQuery syntax: $('#myButton').on('click', function() { ... });


// styling the file upload using jquery (NOTE: jquery is script must be there in the boilerplate)
$(".form-control").on("change", function () {
    var files = Array.from(this.files)
    updatedFiles = files.map(f => { return f.name });
    for (let i = 0; i < updatedFiles.length; i++) {
        if (updatedFiles[i].length > 15) {
            updatedFiles[i] = updatedFiles[i].slice(0, 9).concat(`...${updatedFiles[i].slice(-6)}`)
        }
    }
    var fileName = updatedFiles.join(", ")
    if (files.length > 1) {
        return $(this).siblings(".form-label").addClass("selected").html(fileName)
    }
});