module.exports = {
    path: "/var/node/test-laraqueue/node_modules_fake/laravel-queue/test/data/laravel_fake/",
    config: {
        app: {
            import: true,
            asis: false
        },
        auth: {
            import: true,
            asis: true
        },
        broadcasting: {
            import: true,
            asis: true
        },
        cache: {
            import: false
        },
        compile: {
            import: false
        },
        database: {
            import: true,
            asis: false
        },
        filesystems: {
            import: true,
            asis: true
        },
        mail: {
            import: true,
            asis: false
        },
        queue: {
            import: true,
            asis: true
        },
        service: {
            import: true,
            asis: true
        },
        session: {
            import: false
        },
        view: {
            import: false
        },
        services: {
            import: true,
            asis: true
        }
    },
    addToApp: {
        job: {
            example: "example"
        }
    }
};