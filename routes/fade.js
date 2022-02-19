document.getElementById("#success-alert").hide();
function showAlert() {
    document.getElementById("#success-alert").fadeTo(2000, 500).slideUp(500, function () {
        document.getElementById("#success-alert").slideUp(500);
    });
}
showAlert();