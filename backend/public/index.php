<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/responseHelper.php';

try {
    $connection = getDatabaseConnection();
    sendSuccess(null, "Backend is running and database connection is OK");
} catch (Exception $e) {
    sendError("Database connection failed: " . $e->getMessage(), 500);
}
