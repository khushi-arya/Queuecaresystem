/**
 * QueueCare WebSocket Client
 * 
 * Handles real-time queue updates and patient notifications using STOMP protocol
 * 
 * Dependencies:
 * - SockJS (for WebSocket fallback)
 * - Stomp.js (for STOMP protocol)
 * 
 * Include in HTML:
 * <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
 * <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
 */

class QueueCareWebSocketClient {
    /**
     * Constructor
     * @param {string} serverUrl - WebSocket server URL (e.g., http://localhost:8080)
     * @param {string} authToken - JWT authentication token
     */
    constructor(serverUrl, authToken) {
        this.serverUrl = serverUrl || 'http://localhost:8080';
        this.authToken = authToken;
        this.stompClient = null;
        this.isConnected = false;
        this.subscriptions = [];
        this.messageHandlers = {};
        
        console.log('[QueueCare WebSocket] Client initialized');
    }

    /**
     * Connect to WebSocket server
     * @returns {Promise}
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                // Create SockJS socket
                const socket = new SockJS(`${this.serverUrl}/ws`);
                this.stompClient = Stomp.over(socket);

                // Connection headers
                const headers = {
                    'Authorization': `Bearer ${this.authToken}`
                };

                // Connect
                this.stompClient.connect(headers, 
                    (frame) => {
                        this.isConnected = true;
                        console.log('[QueueCare WebSocket] Connected to server');
                        resolve(frame);
                    },
                    (error) => {
                        this.isConnected = false;
                        console.error('[QueueCare WebSocket] Connection error:', error);
                        reject(error);
                    }
                );

            } catch (error) {
                console.error('[QueueCare WebSocket] Connection failed:', error);
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     * @returns {Promise}
     */
    disconnect() {
        return new Promise((resolve) => {
            if (this.stompClient && this.isConnected) {
                // Unsubscribe from all topics
                this.subscriptions.forEach(sub => sub.unsubscribe());
                this.subscriptions = [];

                // Disconnect
                this.stompClient.disconnect(() => {
                    this.isConnected = false;
                    console.log('[QueueCare WebSocket] Disconnected from server');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Subscribe to queue updates for a doctor
     * 
     * Topic: /topic/queue/{doctorId}
     * 
     * @param {number} doctorId - Doctor ID
     * @param {function} callback - Callback function for updates
     * @returns {string} Subscription ID
     */
    subscribeToQueueUpdates(doctorId, callback) {
        const destination = `/topic/queue/${doctorId}`;
        console.log(`[QueueCare WebSocket] Subscribing to: ${destination}`);

        const subscription = this.stompClient.subscribe(destination, (message) => {
            try {
                const payload = JSON.parse(message.body);
                console.log(`[QueueCare WebSocket] Queue update received:`, payload);
                callback(payload);
            } catch (error) {
                console.error('[QueueCare WebSocket] Error parsing queue update:', error);
            }
        });

        this.subscriptions.push(subscription);
        return subscription.id;
    }

    /**
     * Subscribe to personal patient notifications
     * 
     * Topic: /user/{patientId}/queue-updates
     * 
     * @param {number} patientId - Patient ID
     * @param {function} callback - Callback function for notifications
     * @returns {string} Subscription ID
     */
    subscribeToPersonalNotifications(patientId, callback) {
        const destination = `/user/${patientId}/queue-updates`;
        console.log(`[QueueCare WebSocket] Subscribing to: ${destination}`);

        const subscription = this.stompClient.subscribe(destination, (message) => {
            try {
                const payload = JSON.parse(message.body);
                console.log(`[QueueCare WebSocket] Personal notification received:`, payload);
                callback(payload);
            } catch (error) {
                console.error('[QueueCare WebSocket] Error parsing notification:', error);
            }
        });

        this.subscriptions.push(subscription);
        return subscription.id;
    }

    /**
     * Unsubscribe from a topic
     * @param {string} subscriptionId - Subscription ID
     */
    unsubscribe(subscriptionId) {
        this.subscriptions = this.subscriptions.filter(sub => {
            if (sub.id === subscriptionId) {
                sub.unsubscribe();
                console.log(`[QueueCare WebSocket] Unsubscribed from: ${subscriptionId}`);
                return false;
            }
            return true;
        });
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnectedStatus() {
        return this.isConnected && this.stompClient && this.stompClient.connected;
    }
}

/**
 * ============================================
 * FRONTEND INTEGRATION EXAMPLES
 * ============================================
 */

/**
 * Example 1: Doctor Dashboard - Real-time Queue View
 * Shows all patients in queue with real-time updates
 */
class DoctorQueueDashboard {
    constructor(doctorId, authToken, serverUrl = 'http://localhost:8080') {
        this.doctorId = doctorId;
        this.wsClient = new QueueCareWebSocketClient(serverUrl, authToken);
        this.currentQueue = [];
    }

    async initialize() {
        try {
            // Connect to WebSocket
            await this.wsClient.connect();
            console.log('Doctor Dashboard: WebSocket connected');

            // Subscribe to queue updates
            this.wsClient.subscribeToQueueUpdates(this.doctorId, (update) => {
                console.log('Queue update received:', update);
                this.currentQueue = update.queue || [];
                this.handleQueueUpdate(update);
            });

        } catch (error) {
            console.error('Doctor Dashboard: Failed to initialize', error);
        }
    }

    handleQueueUpdate(update) {
        console.log(`Queue Update Type: ${update.updateType}`);
        console.log(`Total Waiting: ${update.totalWaiting}`);
        console.log(`Total In Progress: ${update.totalInProgress}`);
        
        // Update UI with queue data
        this.renderQueue();

        // Show notification based on update type
        switch (update.updateType) {
            case 'ADD':
                console.log('✓ Patient added to queue');
                break;
            case 'CALL':
                console.log('✓ Patient called');
                break;
            case 'COMPLETE':
                console.log('✓ Consultation completed');
                break;
            case 'MISS':
                console.log('✗ Patient marked as missed');
                break;
            case 'REMOVE':
                console.log('✗ Patient removed from queue');
                break;
        }
    }

    renderQueue() {
        console.log('Rendering queue with', this.currentQueue.length, 'patients');
        
        // Example: Update table rows
        const queueHtml = this.currentQueue.map((patient, index) => `
            <tr>
                <td>${patient.queuePosition}</td>
                <td>${patient.patientName}</td>
                <td>${patient.status}</td>
                <td>${patient.patientsAhead} ahead</td>
                <td>${patient.estimatedWaitTimeMinutes} mins</td>
            </tr>
        `).join('');

        // Update DOM
        const queueTableBody = document.querySelector('#queue-table tbody');
        if (queueTableBody) {
            queueTableBody.innerHTML = queueHtml;
        }
    }

    async destroy() {
        await this.wsClient.disconnect();
    }
}

/**
 * Example 2: Patient Portal - Real-time Queue Position Tracking
 * Shows patient's position in queue and notifications
 */
class PatientQueueTracker {
    constructor(patientId, authToken, serverUrl = 'http://localhost:8080') {
        this.patientId = patientId;
        this.wsClient = new QueueCareWebSocketClient(serverUrl, authToken);
        this.currentQueue = null;
    }

    async initialize() {
        try {
            // Connect to WebSocket
            await this.wsClient.connect();
            console.log('Patient Tracker: WebSocket connected');

            // Subscribe to personal notifications
            this.wsClient.subscribeToPersonalNotifications(this.patientId, (notification) => {
                console.log('Notification received:', notification);
                this.handleNotification(notification);
            });

        } catch (error) {
            console.error('Patient Tracker: Failed to initialize', error);
        }
    }

    handleNotification(notification) {
        const {
            notificationType,
            message,
            currentPosition,
            patientsAhead,
            estimatedWaitTimeMinutes,
            doctorName
        } = notification;

        console.log('='.repeat(50));
        console.log(`Message: ${message}`);
        console.log(`Position: ${currentPosition}`);
        console.log(`Patients Ahead: ${patientsAhead}`);
        console.log(`Est. Wait: ${estimatedWaitTimeMinutes} minutes`);
        console.log('='.repeat(50));

        // Update UI
        this.updateQueueStatus(notification);

        // Show browser notification for important events
        if (notificationType === 'TURN_NEAR' || notificationType === 'CALLED') {
            this.showBrowserNotification(message);
        }

        // Audio notification for "CALLED"
        if (notificationType === 'CALLED') {
            this.playAudio();
        }
    }

    updateQueueStatus(notification) {
        const statusContainer = document.querySelector('#patient-queue-status');
        if (!statusContainer) return;

        const html = `
            <div class="queue-status-card">
                <h3>${notification.doctorName}</h3>
                <div class="position">Position: <strong>${notification.currentPosition}</strong></div>
                <div class="ahead">Patients Ahead: <strong>${notification.patientsAhead}</strong></div>
                <div class="wait-time">Est. Wait: <strong>${notification.estimatedWaitTimeMinutes}</strong> minutes</div>
                <div class="status-badge ${notification.notificationType.toLowerCase()}">
                    ${notification.notificationType}
                </div>
            </div>
        `;

        statusContainer.innerHTML = html;
    }

    showBrowserNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('QueueCare', {
                body: message,
                icon: '/images/hospital-icon.png',
                badge: '/images/hospital-badge.png'
            });
        }
    }

    playAudio() {
        const audio = new Audio('/sounds/turn-called.mp3');
        audio.play().catch(e => console.log('Could not play audio:', e));
    }

    async destroy() {
        await this.wsClient.disconnect();
    }
}

/**
 * ============================================
 * USAGE EXAMPLE IN HTML
 * ============================================
 */

/*
 * HTML Example:
 * 
 * <!-- For Doctor Dashboard -->
 * <div id="queue-dashboard">
 *     <table id="queue-table">
 *         <thead>
 *             <tr>
 *                 <th>Position</th>
 *                 <th>Patient Name</th>
 *                 <th>Status</th>
 *                 <th>Ahead</th>
 *                 <th>Est. Wait</th>
 *             </tr>
 *         </thead>
 *         <tbody></tbody>
 *     </table>
 * </div>
 * 
 * <script>
 *     // Doctor Dashboard
 *     const dashboard = new DoctorQueueDashboard(
 *         12,  // doctorId
 *         'your-jwt-token-here',
 *         'http://localhost:8080'
 *     );
 *     
 *     dashboard.initialize();
 * 
 *     // Patient Tracker
 *     const tracker = new PatientQueueTracker(
 *         5,  // patientId
 *         'your-jwt-token-here',
 *         'http://localhost:8080'
 *     );
 *     
 *     tracker.initialize();
 *     
 *     // Request notification permission
 *     if ('Notification' in window) {
 *         Notification.requestPermission();
 *     }
 * </script>
 */
