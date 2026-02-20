const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    unique: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  experienceLevel: {
    type: String,
    required: [true, 'Please add experience level'],
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  shortDescription: {
    type: String,
    required: [true, 'Please add a short description'],
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  longDescription: {
    type: String,
    required: [true, 'Please add a long description']
  },
  courseCurriculum: [{
    module: {
      type: String,
      required: true
    },
    lessons: [{
      lessonTitle: {
        type: String,
        required: true
      },
      lessonContent: {
        type: String,
        required: true
      },
      duration: {
        type: String, // e.g. "30 mins", "1 hour"
        required: true
      }
    }]
  }],
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be at least 0']
  },
  thumbnail: {
    type: String, // Cloudinary URL
    required: true
  },
  instructor: {
    type: String,
    required: [true, 'Please add an instructor name'],
    trim: true
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  totalStudentsEnrolled: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  numberOfReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Static method to calculate and update average rating and number of reviews
courseSchema.statics.calculateAverageRating = async function(courseId) {
  const obj = await this.aggregate([
    {
      $match: { _id: courseId }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'course',
        as: 'reviews'
      }
    },
    {
      $unwind: '$reviews'
    },
    {
      $group: {
        _id: '$_id',
        averageRating: { $avg: '$reviews.rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.findByIdAndUpdate(courseId, {
      rating: obj[0].averageRating,
      numberOfReviews: obj[0].numberOfReviews
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = mongoose.model('Course', courseSchema);
