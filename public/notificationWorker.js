self.addEventListener('push',(event) => {
    event.waitUntil(
        self.registration.showNotification(event.data.json().title, {
            body: event.data.json().message
        })
    )
    // const data = event.data.json();
    // const title = data.title;
    // const body = data.message;
    // const notificationOptions = {
    //     body: body,
    //     tag: 'simple-push-notification-example',
    //     icon: icon
    // };
    //
    // return self.Notification.requestPermission().then((permission) => {
    //     if (permission === 'granted') {
    //         return new self.Notification(title, notificationOptions);
    //     }
    // });
});