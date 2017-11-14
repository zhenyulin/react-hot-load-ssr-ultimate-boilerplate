// @flow

import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { push } from 'react-router-redux';
import { Form, Text, TextArea } from 'react-form';

import BasicButton from 'components/elements/basic-button';
import SideNav from 'components/widgets/side-nav';
import { Posts, Comments } from 'controllers/actions/blog';
import type { Post, Comment, Author } from 'controllers/types/blog';

import immutableToJS from 'utils/components/immutable-to-js';

type Props = {
  className: string,
  postList: [string],
  posts: { [string]: Post },
  comments: { [string]: Comment },
  authors: { [string]: Author },
  selectedPostId: string,
  navigate: (url: string) => void,
  getPosts: () => void,
  selectPost: (id: string) => void,
  addComment: ({
    post: Post,
    content: string,
    authorName: string,
    authorEmail: string,
  }) => void,
  removeComment: (id: string) => void,
};

export class Page extends React.PureComponent<Props> {
  static defaultProps = {
    postList: [],
    posts: {},
    comments: {},
    authors: {},
    selectedPostId: '',
  };

  componentWillMount() {
    this.props.getPosts();
  }

  render() {
    const {
      className,
      postList,
      posts,
      comments,
      authors,
      selectedPostId,
    } = this.props;
    const { navigate, selectPost, addComment, removeComment } = this.props;
    const selectedPost = posts[selectedPostId] || {
      title: '',
      body: '',
      comments: [],
    };
    return (
      <div className={className}>
        <BasicButton
          className="navButton"
          func={() => navigate('/')}
          text="Back to Index"
        />
        <div className="contentView">
          <SideNav
            className="titles"
            list={postList.map(id => ({
              id,
              value: posts[id].title,
            }))}
            func={selectPost}
          />
          <div className="postContent">
            <div className="title">{selectedPost.title}</div>
            <div className="body">{selectedPost.body}</div>
          </div>
          <div className="comments">
            {selectedPost ? <div className="title">Comments</div> : null}
            <div className="body">
              {selectedPost.comments.map(id => (
                <div key={id} className="comment">
                  <button className="delete" onClick={() => removeComment(id)}>
                    X
                  </button>
                  <div className="author">
                    {authors[comments[id].author].name}:
                  </div>
                  <div className="content">{comments[id].content}</div>
                </div>
              ))}
              {selectedPost ? (
                <div className="comment">
                  <Form
                    onSubmit={({ content, authorName, authorEmail }) =>
                      addComment({
                        post: selectedPost,
                        content,
                        authorName,
                        authorEmail,
                      })}
                  >
                    {formApi => (
                      <form onSubmit={formApi.submitForm}>
                        <label htmlFor="email">
                          Email<Text field="authorEmail" id="email" />
                        </label>
                        <label htmlFor="name">
                          Name<Text field="authorName" id="name" />
                        </label>
                        <label htmlFor="content">
                          Content<TextArea field="content" id="content" />
                        </label>
                        <button type="submit">Add Comment</button>
                      </form>
                    )}
                  </Form>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  postList: state.getIn(['blog', 'posts', 'result']),
  posts: state.getIn(['blog', 'posts', 'entities']),
  comments: state.getIn(['blog', 'comments', 'entities']),
  authors: state.getIn(['blog', 'authors', 'entities']),
  selectedPostId: state.getIn(['blog', 'posts', 'selected']),
});

const mapDispatchToProps = dispatch => ({
  navigate: url => dispatch(push(url)),
  getPosts: () => dispatch(Posts.get()),
  selectPost: id => dispatch(Posts.select(id)),
  addComment: ({ post, content, authorName, authorEmail }) =>
    dispatch(Comments.add({ post, content, authorName, authorEmail })),
  removeComment: id => dispatch(Comments.remove(id)),
});

const component = styled(Page)`
  width: 640px;
  margin: 240px auto;
  line-height: 30px;

  .actionButton {
    background: lightblue;
    color: white;
  }

  .titles {
    display: inline-block;
    float: left;
    width: 120px;
  }

  .postContent {
    display: inline-block;
    float: left;
    width: 320px;
    margin: 20px;
    font-size: 14px;

    .title {
      font-weight: bold;
      line-height: 40px;
    }
  }

  .comments {
    margin-top: 20px;
    display: inline-block;
    float: left;
    width: 160px;
    font-size: 14px;

    .title {
      color: grey;
      line-height: 40px;
    }

    .comment {
      border-top: 1px solid lightgrey;
      padding: 5px 0;
      font-size: 13px;

      .author {
        color: darkgrey;
      }

      .content {
        color: grey;
      }
    }
  }
`;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  immutableToJS,
)(component);
