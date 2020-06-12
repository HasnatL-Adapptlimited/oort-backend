const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    type: {
        type: String,
        enum: [
            'can_create',
            'can_view',
            'can_update',
            'can_delete',
            'can_create_own',
            'can_read_own',
            'can_update_own',
            'can_delete_own'
        ],
        required: true
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        }
    ]
});

module.exports = mongoose.model('Permission', permissionSchema);