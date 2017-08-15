$('#new-msg').keypress(function (e) {
	if (e.which == 13) {
		$('#send-msg').click();
		return false;  
	}
});

$('#send-msg').on('click', function(){
	$('#chats').append(' <div class="msg you-sent"><span class="msg-owner">You : </span>				<span class="msg-text">' + $("#new-msg").val() + ' </span></div>');
	$('#new-msg').val("");
});

$('#open_groups_nav').on('click', function(){
	$('#groups_nav').toggleClass('hidden');
	$('#groups_panel_back').toggleClass('hidden');
});