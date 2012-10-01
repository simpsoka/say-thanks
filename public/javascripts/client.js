(function() {

  $(function() {
    return $('body').addClass('loaded');
  });

  $("input:submit").click(function() {
    $('form').submit();
    $(this).val("Sending...");
    return $("input:submit").attr("disabled", true);
  });

  $('.prop-list a').click(function() {
    $('#prop-input').val($(this).parent('li').index());
    return $.pageTransition('slide', false, 0, $('#form-page-2'), $('#form-page-1')).then(function() {
      return $(".chzn-select").chosen();
    });
  });

}).call(this);
