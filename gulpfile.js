const gulp = require('gulp');
const del = require('del');
const os = require('os');

let dasherFolder;
let determineWidgetFolder = () => {
    switch (process.platform) {
        case 'darwin':
            return `${os.homedir()}/Library/Application Support/io.orleans.dasher/`;
        case 'win32':
            return `${os.homedir()}/AppData/Local/io.orleans.dasher/`;
        default:
            return `${os.homedir()}/usr/local/share/io.orleans.dasher/`;
    }
};

gulp.task('cp:widgets', () => {
    if (!dasherFolder) {
        dasherFolder = determineWidgetFolder();
    }
    gulp.src('./widgets/**/*').dest(`${dasherFolder}/widgets`);
});

gulp.task('rm:widgets', (callback) => {
    if (!dasherFolder) {
        dasherFolder = determineWidgetFolder();
    }
    del([`${dasherFolder}/widgets/**/*`], {dryRun: true}).then((paths) => {
        console.log(paths);
        callback();
    });
});
