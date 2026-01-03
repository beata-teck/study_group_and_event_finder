// src/components/EventDiscussion.jsx
import React, { useState, useEffect } from "react";
import * as API from "../services/api";

function Comment({ comment, onDelete, currentUser }) {
  const canDelete = currentUser && (currentUser.id === comment.user_id || currentUser.is_admin);
  
  return (
    <div style={{ 
      padding: "0.75rem", 
      border: "1px solid var(--border)", 
      borderRadius: 8, 
      marginBottom: "0.5rem",
      background: "var(--surface)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
        <div>
          <strong style={{ color: "var(--text)" }}>{comment.user_name}</strong>
          {comment.user_department && (
            <span style={{ color: "var(--muted)", fontSize: "0.875rem", marginLeft: "0.5rem" }}>
              {comment.user_department} • Year {comment.user_year}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
            {new Date(comment.created_at).toLocaleString()}
          </span>
          {canDelete && (
            <button
              className="btn btn-ghost"
              onClick={() => onDelete?.(comment.id)}
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
              aria-label="Delete comment"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <p style={{ margin: 0, color: "var(--text)", whiteSpace: "pre-wrap" }}>{comment.text}</p>
    </div>
  );
}

export default function EventDiscussion({ eventId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [eventId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await API.commentsAPI.getByEvent(eventId);
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error("Load comments error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    if (!currentUser) {
      setError("Please login to comment");
      return;
    }

    try {
      const response = await API.commentsAPI.create(eventId, newComment.trim());
      if (response.success) {
        setComments((prev) => [response.data, ...prev]);
        setNewComment("");
        setError("");
      }
    } catch (error) {
      setError(error.message || "Failed to post comment");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const response = await API.commentsAPI.delete(commentId);
      if (response.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error("Delete comment error:", error);
    }
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h4 style={{ marginBottom: "1rem", color: "var(--text)" }}>Discussion ({comments.length})</h4>
      
      {!currentUser && (
        <div style={{ 
          padding: "0.75rem", 
          background: "var(--surface)", 
          border: "1px solid var(--border)", 
          borderRadius: 8,
          marginBottom: "1rem",
          color: "var(--muted)"
        }}>
          Please login to participate in discussions.
        </div>
      )}

      {currentUser && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                setError("");
              }}
              placeholder="Share your thoughts, ask questions, or discuss study materials..."
              rows={3}
              style={{
                padding: "0.75rem",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text)",
                resize: "vertical",
                fontFamily: "inherit"
              }}
            />
            {error && (
              <div style={{ color: "var(--danger)", fontSize: "0.875rem" }}>{error}</div>
            )}
            <button type="submit" className="btn btn-primary" style={{ justifySelf: "start" }}>
              Post Comment
            </button>
          </div>
        </form>
      )}

      <div>
        {loading ? (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={handleDelete}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
}