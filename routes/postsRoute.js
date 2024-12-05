const uploadImageToCloudinary = require('../utils/cloudnary');
const Post = require('../models/post');

const postsRoute = async (req, res) => {
    try {
        const result = await uploadImageToCloudinary(req.file.path);

        const newPost = new Post({
            user: req.user.id,
            mediaUrl: result.secure_url,
        });

        await newPost.save();
        res.json({ message: 'Post created successfully', post: newPost });
    } catch (err) {
        console.error('Error creating post:', err.message);
        res.status(500).json({ message: 'Error creating post', error: err.message });
    }
};

module.exports = postsRoute;
