const { Thought, User } = require('../models');

const thoughtController = {
  // GET to get all thoughts
  getAllThoughts(req, res) {
    Thought.find({})
      .select('-__v')
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json(err));
  },

  // GET to get a single thought by its _id
  getThoughtById(req, res) {
    const { thoughtId } = req.params;

    Thought.findById(thoughtId)
      .select('-__v')
      .then((thought) => {
        if (!thought) {
          return res.status(404).json({ message: 'Thought not found' });
        }
        res.json(thought);
      })
      .catch((err) => res.status(500).json(err));
  },

  // POST to create a new thought
  createThought(req, res) {
    const { thoughtText, username, userId } = req.body;

    Thought.create({ thoughtText, username, userId })
      .then((thought) => {
        // Push the created thought's _id to the associated user's thoughts array field
        return User.findByIdAndUpdate(
          userId,
          { $push: { thoughts: thought._id } },
          { new: true, runValidators: true }
        );
      })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ thought, user });
      })
      .catch((err) => res.status(500).json(err));
  },

  // PUT to update a thought by its _id
  updateThought(req, res) {
    const { thoughtId } = req.params;
    const { thoughtText } = req.body;

    Thought.findByIdAndUpdate(
      thoughtId,
      { thoughtText },
      { new: true, runValidators: true }
    )
      .then((thought) => {
        if (!thought) {
          return res.status(404).json({ message: 'Thought not found' });
        }
        res.json(thought);
      })
      .catch((err) => res.status(500).json(err));
  },

  // DELETE to remove a thought by its _id
  deleteThought(req, res) {
    const { thoughtId } = req.params;

    Thought.findByIdAndDelete(thoughtId)
      .then((thought) => {
        if (!thought) {
          return res.status(404).json({ message: 'Thought not found' });
        }
        // Remove the thought's _id from the associated user's thoughts array field
        return User.findByIdAndUpdate(
          thought.userId,
          { $pull: { thoughts: thoughtId } },
          { new: true, runValidators: true }
        );
      })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Thought and associated user data deleted' });
    })
    .catch((err) => res.status(500).json(err));
},

// POST to create a reaction stored in a single thought's reactions array field
createReaction(req, res) {
  const { thoughtId } = req.params;
  const { reactionBody, username } = req.body;

  Thought.findByIdAndUpdate(
    thoughtId,
    { $push: { reactions: { reactionBody, username } } },
    { new: true, runValidators: true }
  )
    .then((thought) => {
      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }
      res.json(thought);
    })
    .catch((err) => res.status(500).json(err));
},

// DELETE to pull and remove a reaction by the reaction's reactionId value
deleteReaction(req, res) {
  const { thoughtId, reactionId } = req.params;

  Thought.findByIdAndUpdate(
    thoughtId,
    { $pull: { reactions: { reactionId } } },
    { new: true, runValidators: true }
  )
    .then((thought) => {
      if (!thought) {
        return res.status(404).json({ message: 'Thought not found' });
      }
      res.json(thought);
    })
    .catch((err) => res.status(500).json(err));
},
};

module.exports = thoughtController;
