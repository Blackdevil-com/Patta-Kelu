-- Insert Default Roles
INSERT INTO roles (id, name, description) VALUES 
(1, 'ROLE_USER', 'Standard registered listener'),
(2, 'ROLE_ARTIST', 'Verified music artist with catalog management privileges'),
(3, 'ROLE_ADMIN', 'Platform super administrator')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Genres
INSERT INTO genres (id, name, slug, color_code) VALUES
(1, 'Pop', 'pop', '#E1306C'),
(2, 'Hip Hop', 'hip-hop', '#BA55D3'),
(3, 'Rock', 'rock', '#E74C3C'),
(4, 'Electronic', 'electronic', '#00D2BE'),
(5, 'R&B', 'r-and-b', '#9B59B6'),
(6, 'Indie', 'indie', '#2ECC71'),
(7, 'Classical', 'classical', '#F39C12'),
(8, 'Jazz', 'jazz', '#3498DB')
ON CONFLICT (name) DO NOTHING;
