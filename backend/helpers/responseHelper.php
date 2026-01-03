<?php

function sendSuccess($data = null, string $message = "Success", int $statusCode = 200): void
{
    http_response_code($statusCode);
    header("Content-Type: application/json");

    echo json_encode([
        "success" => true,
        "message" => $message,
        "data" => $data
    ]);

    exit;
}

function sendError(string $message = "Error", int $statusCode = 400): void
{
    http_response_code($statusCode);
    header("Content-Type: application/json");

    echo json_encode([
        "success" => false,
        "message" => $message
    ]);

    exit;
}
