RideInSync/
├── .git/
├── .DS_Store
├── auth-ms/
│   ├── .gitignore
│   ├── config.env
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── api/
│       │   ├── controllers/
│       │   │   ├── user.controller.js
│       │   │   └── driver.controller.js
│       │   ├── middlewares/
│       │   │   └── error.middleware.js
│       │   ├── validators/
│       │   │   ├── user.validator.js
│       │   │   └── driver.validator.js
│       │   └── routes/
│       │       ├── index.js
│       │       ├── user.routes.js
│       │       ├── driver.routes.js
│       │       └── common.routes.js
│       ├── config/
│       │   ├── env.config.js
│       │   └── logger.js
│       ├── constants/
│       │   └── index.js
│       ├── models/
│       │   ├── index.js
│       │   ├── user.model.js
│       │   ├── driver.model.js
│       │   ├── user-docs.model.js
│       │   └── driver-docs.model.js
│       ├── services/
│       │   ├── index.js
│       │   ├── user.service.js
│       │   ├── driver.service.js
│       │   ├── token.service.js
│       │   ├── email.service.js
│       │   ├── user-docs.service.js
│       │   └── driver-docs.service.js
│       └── utils/
│           ├── catchAsync.js
│           └── ApiError.js
├── admin-ms/
│   ├── .gitignore
│   ├── config.env
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── api/
│       │   ├── controllers/
│       │   │   ├── company.controller.js
│       │   │   └── admin.controller.js
│       │   ├── middlewares/
│       │   │   └── error.middleware.js
│       │   ├── validators/
│       │   │   ├── company.validator.js
│       │   │   └── admin.validator.js
│       │   └── routes/
│       │       ├── index.js
│       │       ├── company.routes.js
│       │       └── admin.routes.js
│       ├── config/
│       │   ├── env.config.js
│       │   └── logger.js
│       ├── constants/
│       │   └── index.js
│       ├── models/
│       │   ├── index.js
│       │   ├── company.model.js
│       │   └── admin.model.js
│       ├── services/
│       │   ├── index.js
│       │   ├── company.service.js
│       │   └── admin.service.js
│       └── utils/
│           ├── catchAsync.js
│           └── ApiError.js
├── booking-ms/
│   ├── .gitignore
│   ├── config.env
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── api/
│       │   ├── controllers/
│       │   │   ├── ride.controller.js
│       │   │   └── booking.controller.js
│       │   ├── middlewares/
│       │   │   └── error.middleware.js
│       │   ├── validators/
│       │   │   ├── ride.validator.js
│       │   │   └── booking.validator.js
│       │   └── routes/
│       │       ├── index.js
│       │       ├── ride.routes.js
│       │       └── booking.routes.js
│       ├── config/
│       │   ├── env.config.js
│       │   └── logger.js
│       ├── constants/
│       │   └── index.js
│       ├── jobs/
│       │   └── rideAssignment.job.js
│       ├── models/
│       │   ├── index.js
│       │   ├── ride.model.js
│       │   └── booking.model.js
│       ├── services/
│       │   ├── index.js
│       │   ├── ride.service.js
│       │   └── booking.service.js
│       └── utils/
│           ├── catchAsync.js
│           └── ApiError.js
└── gateway/
    ├── .gitignore
    ├── app.js
    ├── config.env
    ├── package.json
    ├── package-lock.json
    └── node_modules/
