const { Thought } = require('../models/Thought');
const { User } = require('../models/User');

const userController = {
  // GET all users
  getAllUsers(req, res) {
    User.find({})
      .populate({
        path: 'thoughts',
        select: '-__v', // Exclude __v field from populated thoughts
      })
      .populate('friends', '-__v') // Exclude __v field from populated friends
      .select('-__v')
      .then((users) => res.json(users))
      .catch((err) => res.status(500).json(err));
  },

  // GET a single user by ID and populated thought and friend data
  getUserById(req, res) {
    const { userId } = req.params;

    User.findById(userId)
      .populate({
        path: 'thoughts',
        select: '-__v',
      })
      .populate('friends', '-__v')
      .select('-__v')
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
      })
      .catch((err) => res.status(500).json(err));
  },

  // POST a new user
  createUser(req, res) {
    const { username, email } = req.body;

    User.create({ username, email })
      .then((user) => res.json(user))
      .catch((err) => res.status(500).json(err));
  },

  // PUT to update a user by ID
  updateUser(req, res) {
    const { userId } = req.params;
    const { username, email } = req.body;

    User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
      })
      .catch((err) => res.status(500).json(err));
  },

  // DELETE to remove a user by ID
  deleteUser(req, res) {
    const { userId } = req.params;

    User.findByIdAndDelete(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        // BONUS: Remove a user's associated thoughts when deleted
        return Thought.deleteMany({ username: user.username });
      })
      .then(() => res.json({ message: 'User and associated thoughts deleted' }))
      .catch((err) => res.status(500).json(err));
  },

  // POST to add a new friend to a user's friend list
  addFriend(req, res) {
    const { userId, friendId } = req.params;

    User.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friendId } },
      { new: true, runValidators: true }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
      })
      .catch((err) => res.status(500).json(err));
  },

  // DELETE to remove a friend from a user's friend list
  removeFriend(req, res) {
    const { userId, friendId } = req.params;

    User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true, runValidators: true }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
      })
      .catch((err) => res.status(500).json(err));
  },
};

module.exports = userController;
