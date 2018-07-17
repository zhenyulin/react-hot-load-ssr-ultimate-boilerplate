import express from 'express';

import Post from 'server/models/post';
import Comment from 'server/models/comment';
import Author from 'server/models/author';

const router = express.Router();

const findAll = model => async (req, res) => {
  try {
    const posts = await model.find();
    return res.send(posts);
  } catch (e) {
    return res.status(404).send(e);
  }
};

const basicCreate = model => async (req, res) => {
  try {
    const input = req.body;
    const post = await model.create(input);
    return res.status(201).send(post);
  } catch (e) {
    return res.status(409).send(e);
  }
};

const findById = (model, field = 'id') => async (req, res) => {
  try {
    const id = req.params[field];
    const item = await model.findById(id);
    return res.send(item);
  } catch (e) {
    return res.status(404).send(e);
  }
};

const updateById = (model, field = 'id') => async (req, res) => {
  try {
    const id = req.params[field];
    const update = req.body;
    const updated = await model.findOneAndUpdate({ _id: id }, update, {
      new: true,
    });
    return res.send(updated);
  } catch (e) {
    return res.send(e);
  }
};

const deleteById = (model, field = 'id') => async (req, res) => {
  try {
    const id = req.params[field];
    const deleted = await model.findByIdAndRemove(id);
    return res.send(deleted);
  } catch (e) {
    return res.status(404).send(e);
  }
};

const createAuthor = async author => {
  try {
    const result = await Author.findOneOrCreate(
      { email: author.email },
      author,
    );
    return result;
  } catch (e) {
    return e;
  }
};

router
  .route('/posts')
  .get(findAll(Post))
  .post(basicCreate(Post));

router
  .route('/posts/:id')
  .get(findById(Post))
  .put(updateById(Post))
  .delete(deleteById(Post));

router
  .route('/comments')
  .get(findAll(Comment))
  .post(async (req, res) => {
    try {
      const input = req.body;
      const author = await createAuthor(input.author);
      const inputWithAuthorId = { ...input, author: author._id };
      const comment = await Comment.create(inputWithAuthorId);
      return res.send(comment);
    } catch (e) {
      return res.send(e);
    }
  });

router
  .route('/comments/:id')
  .get(findById(Comment))
  .put(updateById(Comment))
  .delete(deleteById(Comment));

router
  .route('/authors')
  .get(findAll(Author))
  .post(basicCreate(Author));

router
  .route('/authors/:id')
  .get(findById(Author))
  .put(updateById(Author))
  .delete(async (req, res) => {
    try {
      const { id } = req.params;
      const author = await Author.findByIdAndRemove(id);
      const { commented } = author;
      const comments = await Comment.find({ _id: { $in: commented } });
      const commentsPosted = comments.map(comment => comment.posted);
      await Post.update(
        {
          _id: { $in: commentsPosted },
        },
        {
          $pull: { comments: { $in: commented } },
        },
        {
          multi: true,
          new: true,
        },
      );
      await Comment.remove({ _id: { $in: commented } });
      return res.send(author);
    } catch (e) {
      return res.send(e);
    }
  });

export default router;
