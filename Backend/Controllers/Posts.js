const { paginateHelper } = require('../Helpers');
const { PostsModel } = require('../Models');
const mongoose = require('mongoose');
// const {  PostsModel } = require('./');

const createPost = async (req, res) => {
  if (!req.body.description)
    return res.json({ success: false, result: 'Description cannot be empty, please add a description to continue' });
  if (!req.body.authorId)
    return res.json({ success: false, result: 'AuthorId is required but missing, please try again' });
  if (!req.body.type)
    return res.json({ success: false, result: 'Type of post is required but missing, please try again' });

  if (req.body.type === 'poll' && (!req.body.pollOptions || req.body.pollOptions.length < 2))
    return res.json({
      success: false,
      result: 'You should provide the poll options and they should be atleast 2 options'
    });

  if (req.body.type === 'event' && (!req.body.eventTime || !req.body.eventDate || !req.body.eventInterval))
    return res.json({
      success: false,
      result: 'You should event date, event time and event interval in order to continue'
    });

  const Post = new PostsModel({ ...req.body, dateCreated: new Date().toISOString(), followers: [] });
  try {
    await Post.save().then((result) => res.json({ success: true, result }));
  } catch (error) {
    return res.json({ success: false, result: error.message });
  }
};

const getPost = async (req, res) => {
  if (!req.params.postId) return res.json({ success: false, result: 'Post id is required, please try again' });
  // if (!req.body.owner || !req.body.owner.userId)
  //   return res.json({ success: false, result: 'Owner of review is required, please try again' });
  const { postId: _id } = req.params;
  try {
    await PostsModel.findOne({ _id }).then((result) => res.json({ success: true, result }));
  } catch (error) {
    return res.json({ success: false, result: error.message });
  }
};

const getAllPosts = async (req, res) => {
  const { page = 1, limit = 2 } = req.query;
  try {
    const total = await PostsModel.find().countDocuments();

    await PostsModel.find().limit(limit * 1).skip((page - 1) * limit).then(async (result) => {
      return paginateHelper(page, limit, total, result, res);
    });
  } catch (error) {
    return res.json({ success: false, result: error.message });
  }
};

const getRandomPosts = async (req, res) => {
  const { limit: size = 10 } = req.query;
  try {
    await PostsModel.aggregate([ { $sample: { size } } ]).then((result) => res.json({ success: true, result }));
    // return res.json({ success: false, result: 'It worked on' });
  } catch (error) {
    return res.json({ success: false, result: error.message });
  }
};

const getUserPosts = async (req, res) => {
  if (!req.params.authorId) return res.json({ success: false, result: 'Author id is required, please try again' });
  const { page = 1, limit = 2 } = req.query;

  const { authorId } = req.params;

  try {
    const total = await PostsModel.find({ authorId }).countDocuments();
    await PostsModel.find({ authorId }).limit(limit * 1).skip((page - 1) * limit).then(async (result) => {
      // const userIds = [ ...result.map((r) => r.authorId) ];
      // const final = await addUserObject(userIds, result, 'authorId', res);
      paginateHelper(page, limit, total, result, res);
    });
  } catch (error) {
    return res.json({ success: false, result: error.message });
  }
};

const updatePost = async (req, res) => {
  if (!req.params.postId) return res.json({ success: false, result: 'User id is required, please try again' });
  // if (!req.body.owner || !req.body.owner.postId)
  //   return res.json({ success: false, result: 'Owner of review is required, please try again' });
  const { postId: _id } = req.params;
  try {
    await PostsModel.updateOne({ _id }, req.body).then((result) => {
      if (result.nModified === 1) return res.json({ success: true, result: 'Successfully updated post' });
      return res.json({ success: false, result: 'Nothing was updated please try again' });
    });
  } catch (error) {
    return res.json({ success: false, result: error.message });
  }
};

const likePost = async (req, res) => {
  if (!req.body.userId) return res.json({ success: false, result: 'User id is required, please try again' });

  const { userId } = req.body;
  const { postId: _id } = req.params;

  try {
    const result = await PostsModel.updateOne({ _id }, { $push: { likes: userId } });
    console.log('RESul', result);
    if (result.nModified <= 0) return res.json({ success: false, result: error.message });
    return res.json({ success: true, result: 'Successfully liked post' });
  } catch (error) {
    return res.json({ success: false, result: error.message });
  }
};

const deletePost = async (req, res) => {
  if (!req.params.postId) return res.json({ success: false, result: 'Post id is required, please try again' });
  const { postId: _id } = req.params;
  try {
    await PostsModel.deleteOne({ _id }).then((result) => {
      console.log('DElete', result);
      if (result.deletedCount > 0) return res.json({ success: true, result: 'Successfully updated post' });
      return res.json({ success: false, result: 'Nothing was updated please try again' });
    });
  } catch (error) {
    return res.json({ success: false, result: error.message });
  }
};

module.exports = { createPost, getPost, updatePost, likePost, getUserPosts, getAllPosts, getRandomPosts, deletePost };
