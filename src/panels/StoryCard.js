import { useState } from 'react';
import {
    Card, Text, Title, Button, Avatar, IconButton
} from '@vkontakte/vkui';
import {
    Icon28LikeOutline, Icon28ViewOutline, Icon28BookmarkOutline,
    Icon28LikeCircleFillRed, Icon28Bookmark
} from '@vkontakte/icons';
import api from '../api';

export const StoryCard = ({ story, onClick, token, onLikeChange, onFollowChange, onBookmarkChange, currentUserId }) => {
    const [isLiked, setIsLiked] = useState(story.is_liked);
    const [likesCount, setLikesCount] = useState(story.likes_count);
    const [isFollowing, setIsFollowing] = useState(story.is_following_author);
    const [isBookmarked, setIsBookmarked] = useState(story.is_bookmarked);
    const [bookmarksCount, setBookmarksCount] = useState(story.bookmarks_count);

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            if (isLiked) {
                await api.delete(`/social/likes/${story.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setLikesCount(prev => prev - 1);
            } else {
                await api.post('/social/likes', { story_id: story.id }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setLikesCount(prev => prev + 1);
            }
            setIsLiked(!isLiked);
            if (onLikeChange) onLikeChange(story.id, !isLiked);
        } catch (error) {
            console.error('Error toggling like:');
        }
    };

    const handleFollow = async (e) => {
        e.stopPropagation();
        try {
            if (isFollowing) {
                await api.delete(`/social/unfollow/${story.author_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await api.post('/social/follow', { followed_id: story.author_id }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
            setIsFollowing(!isFollowing);
            if (onFollowChange) onFollowChange(story.author_id, !isFollowing);
        } catch (error) {
            console.error('Error toggling follow:');
        }
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();
        try {
            if (isBookmarked) {
                await api.delete(`/social/bookmarks/${story.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setBookmarksCount(prev => prev - 1);
            } else {
                await api.post('/social/bookmarks', { story_id: story.id }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setBookmarksCount(prev => prev + 1);
            }
            setIsBookmarked(!isBookmarked);
            if (onBookmarkChange) onBookmarkChange(story.id, !isBookmarked);
        } catch (error) {
            console.error('Error toggling bookmark:');
        }
    };

    return (
        <Card mode="shadow" style={{  width: '100%', marginBottom: 16  }} onClick={() => onClick(story.id)}>
            <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar size={36} src={story.author_avatar_url} />
                        <Text weight="medium" style={{ marginLeft: 12 }}>{story.author_name}</Text>
                    </div>
                    {story.author_id !== currentUserId && (
                        <Button
                            mode={isFollowing ? "secondary" : "primary"}
                            size="s"
                            onClick={handleFollow}
                        >
                            {isFollowing ? "Отписаться" : "Подписаться"}
                        </Button>
                    )}
                </div>
                <Title level="3" style={{ marginBottom: 8, fontSize: 18 }}>{story.title}</Title>
                <img src={story.cover_image_url} alt={story.title} style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
                <Text style={{ marginBottom: 12 }}>{story.summary}</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={handleLike}>
                                {isLiked ? <Icon28LikeCircleFillRed /> : <Icon28LikeOutline />}
                            </IconButton>
                            {likesCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={handleBookmark}>
                                {isBookmarked ? <Icon28Bookmark /> : <Icon28BookmarkOutline />}
                            </IconButton>
                            {bookmarksCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center' }}><Icon28ViewOutline/>{story.views}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
