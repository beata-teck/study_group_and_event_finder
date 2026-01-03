<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/responseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $connection = getDatabaseConnection();

    /* =======================
       GET EVENTS
    ======================= */
    if ($method === 'GET') {

        $query = "
            SELECT 
                e.id,
                e.title,
                e.subject,
                e.description,
                e.category,
                e.event_date,
                e.event_time,
                e.location,
                e.organizer,
                e.created_at,
                u.name AS creator_name
            FROM events e
            JOIN users u ON e.created_by = u.id
            WHERE e.status = 'approved'
            ORDER BY e.event_date ASC, e.event_time ASC
        ";

        $result = $connection->query($query);
        $events = $result->fetch_all(MYSQLI_ASSOC);

        sendSuccess($events, 'Events fetched successfully');
        return;
    }

    /* =======================
       CREATE EVENT
    ======================= */
    if ($method === 'POST') {

        // TEMP: hardcoded user until authentication is implemented
        $createdBy = 1;

        $rawBody = file_get_contents('php://input');
        $data    = json_decode($rawBody, true);   // decode to associative array[web:19][web:48]

        // basic JSON/body validation
        if (!is_array($data)) {
            sendError('Invalid JSON body', 400);
            return;
        }

        if (empty($data['title']) || empty($data['event_date'])) {
            sendError('Title and event_date are required', 400);
            return; // stop execution after error[web:23]
        }

        // prepare values as variables (required for bind_param)[web:14][web:34]
        $title       = $data['title'];
        $subject     = $data['subject']     ?? null;
        $description = $data['description'] ?? null;
        $category    = $data['category']    ?? 'General';
        $eventDate   = $data['event_date'];
        $eventTime   = $data['event_time']  ?? null;
        $location    = $data['location']    ?? null;
        $organizer   = $data['organizer']   ?? null;

        $stmt = $connection->prepare("
            INSERT INTO events 
            (title, subject, description, category, event_date, event_time, location, organizer, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            'ssssssssi',
            $title,
            $subject,
            $description,
            $category,
            $eventDate,
            $eventTime,
            $location,
            $organizer,
            $createdBy
        );

        $stmt->execute();

        $eventId = (int)$stmt->insert_id;

        // fetch the newly created event safely with prepared SELECT[web:15][web:17]
        $stmt2 = $connection->prepare("
            SELECT 
                e.*, 
                u.name AS creator_name
            FROM events e
            JOIN users u ON e.created_by = u.id
            WHERE e.id = ?
        ");

        $stmt2->bind_param('i', $eventId);
        $stmt2->execute();
        $result = $stmt2->get_result();

        sendSuccess($result->fetch_assoc(), 'Event created successfully', 201);
        return;
    }

    /* =======================
       METHOD NOT ALLOWED
    ======================= */
    sendError('Method not allowed', 405);

} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}




