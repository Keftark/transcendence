document.addEventListener("DOMContentLoaded", function() {
    const inputElement = document.getElementById('myInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.getElementById('messages');
    const chatBox = document.getElementById('chatBox');
    const toggleSizeButton = document.getElementById('toggleSizeButton');
    const toggleIcon = document.getElementById('toggleIcon'); // Image element for the toggle button

    // Automatically focus on the input element
    inputElement.focus();

    // Handle sending the message
    sendButton.addEventListener('click', function() {
        const messageText = inputElement.value.trim();
        
        if (messageText !== "") {
            const newMessage = document.createElement('div');
            newMessage.classList.add('message');
            newMessage.textContent = messageText;
            messagesContainer.appendChild(newMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            inputElement.value = '';
            inputElement.focus();
        }
    });

    // Allow pressing 'Enter' to send the message
    inputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    // Toggle between expanded and shrunk states
    toggleSizeButton.addEventListener('click', function() {
        if (chatBox.classList.contains('expanded')) {
            // Start shrinking and delay hiding the elements
            chatBox.classList.remove('expanded');
            chatBox.classList.add('shrunk');
            toggleIcon.src = 'icons/grow.png'; // Change the icon to grow

            // Delay hiding the elements until the animation is done
            setTimeout(function() {
                chatBox.classList.add('hide-elements');
            }, 400); // 400ms matches the CSS animation duration
        } else {
            // Show elements immediately when growing
            chatBox.classList.remove('shrunk');
            chatBox.classList.remove('hide-elements');
            chatBox.classList.add('expanded');
            toggleIcon.src = 'icons/shrink.png'; // Change the icon back to shrink
        }
    });

    // Initialize with expanded state
    chatBox.classList.add('expanded');
});
