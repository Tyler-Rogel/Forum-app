const express = require("express");
const { runInNewContext } = require("vm");
const { User, Thread } = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();

// tel your server to understand how to handle json
app.use(express.json());

// allow serving of UI code
app.use(express.static(`${__dirname}/../public/`));

setUpSession(app);
setUpAuth(app);
// 9
app.post("/users", async (req, res) => {
  try {
    let user = await User.create({
      username: req.body.username,
      fullname: req.body.fullname,
      password: req.body.password,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({
      message: `post request failed to create user`,
      error: err,
    });
  }
});

app.get("/thread/:id", async(req, res) => {
  // implement me :)
  // no authentication needed a.k.a. authorization is public/open
  let thread;
  // get the thread
  try{
    thread = await Thread.findById(req.params.id);
    if (!thread) {
        res.status(404).json({
            message: "thread not found",
        });
        return;
    }
  } catch (err) {
    res.status(500).json({
      message: "get request failed to get thread",
      error: err,
    });
    return;
  }
  // get the user
  try {
    thread = thread.toObject();
    let user = await User.findById(thread.user_id, "-password"); // how would you omit the pasword?
    thread.user = user;
  } catch (err) {
    console.log(
      `unable to get user ${thread.user_id} when getting thread ${thread._id}: ${err}`
    );
  }
  // get the posts (we don't have posts yet so just put a comment)
for (let i in thread.posts){
    try {
        thread.posts[i].user = await User.findById(
            thread.posts[i].user_id,
            "-password"
        );
    }catch (err){
        console.log("bad stuff happebed err", err);
    }
}
  // return the thread
  res.status(200).json(thread);
});

app.get("/threads", async (req, res) => {
  // no authentication needed a.k.a. authorization is public/open
let threads;
  // get the threads (extra points for omitting the posts)
  try {
    threads = await Thread.find({}, "-posts");
  } catch (err) {
    res.status(500).json({
      message: "list request failed to get threads",
      error: err,
    });
    return;
  }

  // get all the users for all the threads
  for (let k in threads) {
    try {
      threads[k] = threads[k].toObject();
      let user = await User.findById(threads[k].user_id, "-password"); // how would you omit the pasword?
      threads[k].user = user;
    } catch (err) {
      console.log(
        `unable to get user ${threads[k].user_id} when getting thread ${threads[k]._id}: ${err}`
      );
    }
  }

  // return the threads (extra points for getting the users to show up in the response)
  res.status(200).json(threads);
});

app.post("/thread", async (req, res) => {
  // auth
  if (!req.user) {
    res.status(401).json({ message: "unauthed" });
    return;
  }
  // create with await + try/catch
  try {
    let thread = await Thread.create({
      user_id: req.user.id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
    });
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({
      message: "could not create thread",
      error: err,
    });
    return;

  }
});

app.delete("/thread/:id", async (req, res) => {
    //check if authed
    if (!req.user) {
        res.status(401).json({ message: "unauthenticated"});
        return;
    }
    console.log(`request to delete a single thread with id ${req.params.id}`);
    let thread;
// get the thread to check if the current user is allowed to delete it
    try {
        thread = await Thread.findById(req.params.id);
    } catch (err){
        res.status(500).json({
            message: `failed to delete thread`,
            error: err,
        });
        return;
    }
    //check if we found it
    if (thread === null) {
        res.status(404).json({
            message: `thread not found`,
            thread_id: req.params.thread_id,
        });
        return; 
    }
//check if current user made the post
    if (thread.user_id !=req.user.id) {
        res.status(403).json({message: "unauthorized"});
        return;
    }
// delete the post
    try{
        await Thread.findByIdAndDelete(req.params.id);
    } catch (err) {
        res.status(500).json({
            message: `failed to delete post`,
            error: err,
        });
        return;
    }
    // return
    res.status(200).json(thread);
});

app.post("/post", async (req, res) => {
let thread;

try {
    thread = await Thread.findByIdAndUpdate(
        req.body.thread_id,
        {
            $push: {
                posts: {
                    user_id: req.user.id,
                    body: req.body.body,
                    thread_id: req.body.thread_id,
                },
            },
        },
        {
            new: true,
        }
    )
    if (!thread) {
        res.status(404).json({
            message: `thread not found`,
            id: req.body.thread_id,
        });
        return;
    }
} catch (err) {
    res.status(500).json({
        message: "failed to insert post",
        error: err,
    });
    return;
}
res.status(201).json(thread.posts[thread.posts.length - 1]);
});
app.delete("/thread/:thread_id/post/:post_id", (req, res) => {

});

module.exports = app;