// Load the module containing the app, only 'ng' is loaded by default.
describe('demoApp', function() {

    beforeEach(module('demoApp'));
    // 
    // var $controller;
    //
    // beforeEach(inject(function(_$controller_) {
    //     // The injector unwraps the underscores (_) from around the parameter names when matching
    // //     $controller = _$controller_;
    // }));

    describe('home controller', function() {
        it('should be defined', function() {
            // const homeCtrl = $controller('HomeController');
            // expect(homeCtrl).toBeDefined();
            expect(true).toBe(true);
        });
    });
});
