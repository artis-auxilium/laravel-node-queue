module.exports = {
    attributes: {
        id: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            defaultValue: null
        },
        varchar: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'default text'
        },
        tinyint: {
            type: Sequelize.INTEGER(4),
            allowNull: false,
            defaultValue: null
        },
        text: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: null
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: null
        },
        smallint: {
            type: Sequelize.INTEGER(6),
            allowNull: false,
            defaultValue: null
        },
        mediumint: {
            type: Sequelize.INTEGER(9),
            allowNull: false,
            defaultValue: null
        },
        int: {
            type: Sequelize.INTEGER(11),
            allowNull: false,
            defaultValue: null
        },
        bigint: {
            type: Sequelize.BIGINT,
            allowNull: false,
            defaultValue: null
        },
        float: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: null
        },
        double: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: null
        },
        decimal: {
            type: Sequelize.DECIMAL,
            allowNull: false,
            defaultValue: null
        },
        datetime: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: null
        },
        timestamp: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        time: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: null
        },
        year: {
            type: Sequelize.INTEGER(4),
            allowNull: false,
            defaultValue: null
        },
        char: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: null
        },
        tinyblob: {
            type: Sequelize.BLOB,
            allowNull: false,
            defaultValue: null
        },
        tinytext: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: null
        },
        blob: {
            type: Sequelize.BLOB,
            allowNull: false,
            defaultValue: null
        },
        mediumblob: {
            type: Sequelize.BLOB,
            allowNull: false,
            defaultValue: null
        },
        mediumtext: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: null
        },
        longblob: {
            type: Sequelize.BLOB,
            allowNull: false,
            defaultValue: null
        },
        longtext: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: null
        },
        enum: {
            type: Sequelize.ENUM('1', '2', '3'),
            allowNull: false,
            defaultValue: null
        },
        set: {
            type: Sequelize.ENUM('', '1', '2', '3'),
            allowNull: false,
            defaultValue: null
        },
        bool: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: null
        },
        binary: {
            type: Sequelize.BLOB,
            allowNull: false,
            defaultValue: null
        },
        varbinary: {
            type: Sequelize.BLOB,
            allowNull: false,
            defaultValue: null
        },
        point: {
            type: Sequelize.GEOMETRY('POINT'),
            allowNull: false,
            defaultValue: null
        },
        linestring: {
            type: Sequelize.GEOMETRY('LINESTRING'),
            allowNull: false,
            defaultValue: null
        },
        polygon: {
            type: Sequelize.GEOMETRY('POLYGON'),
            allowNull: false,
            defaultValue: null
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        deleted_at: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        }
    },
    associate: function() {
        /*User.hasOne(Children, {
        foreignKey:  'children_id'
         });
        User.addScope('children',{
        include: [{
        model:Children
        }]
        });*/
    },
    options: {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at',
        classMethods: {},
        instanceMethods: {},
        hooks: {},
        /*defaultScope: {
        where: {
        active: true
        }
        },*/
    }
};