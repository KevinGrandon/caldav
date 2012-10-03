requireRequest();
testSupport.lib('query_builder');
testSupport.lib('request/propfind');
testSupport.lib('request/calendar_query');

suite('caldav/request/calendar_query', function() {
  var Propfind,
      FakeXhr,
      Builder,
      CalendarQuery,
      Connection,
      con,
      Xhr,
      Template,
      oldXhrClass,
      SaxResponse;

  var url = 'http://google.com',
      subject;

  suiteSetup(function() {
    // this is way to much stuff
    Propfind = Caldav.require('request/propfind');
    Builder = Caldav.require('query_builder');
    CalendarQuery = Caldav.require('request/calendar_query');
    SaxResponse = Caldav.require('sax/dav_response');
    Connection = Caldav.require('connection');
    FakeXhr = Caldav.require('support/fake_xhr');
    Template = Caldav.require('template');
    Xhr = Caldav.require('xhr');

    oldXhrClass = Xhr.prototype.xhrClass;
    Xhr.prototype.xhrClass = FakeXhr;
  });

  suiteTeardown(function() {
    Xhr.prototype.xhrClass = oldXhrClass;
  });

  setup(function() {
    con = new Connection();
    subject = new CalendarQuery(con, { url: url });
    FakeXhr.instances.length = 0;
  });

  test('initializer', function() {
    assert.instanceOf(subject, Propfind);
    assert.deepEqual(subject._props, []);
    assert.equal(subject.xhr.headers['Depth'], 1);
    assert.equal(subject.xhr.method, 'REPORT');

    assert.instanceOf(subject.data, Builder);
    assert.instanceOf(subject.filter, Builder);
  });

  test('#_createPayload', function() {
    subject.prop('getetag');

    var cal = subject.data.
                      setComp('VCALENDAR').
                      comp('VEVENT').
                      prop('NAME');

    var filter = subject.filter.
                         setComp('VCALENDAR').
                         comp('VEVENT');
    var props = [
      '<N0:getetag />',
      '<N1:calendar-data>',
        '<N1:comp name="VCALENDAR">',
          '<N1:comp name="VEVENT">',
            '<N1:prop name="NAME" />',
          '</N1:comp>',
        '</N1:comp>',
      '</N1:calendar-data>'
    ].join('');

    var filter = [
      '<N1:comp-filter name="VCALENDAR">',
        '<N1:comp-filter name="VEVENT" />',
      '</N1:comp-filter>'
    ].join('');

    var expected = [
      subject.template.doctype,
      '<N1:calendar-query xmlns:N0="DAV:" ',
          'xmlns:N1="urn:ietf:params:xml:ns:caldav">',
        '<N0:prop>', props, '</N0:prop>',
        '<N1:filter>', filter, '</N1:filter>',
      '</N1:calendar-query>'
    ].join('');

    assert.equal(subject._createPayload(), expected);
  });

  suite('integration', function() {
    var xml,
        data,
        result,
        xhr,
        calledWith;

    testSupport.defineSample('xml/propget.xml', function(data) {
      xml = data;
    });

    setup(function(done) {
      subject.prop('foo');

      subject.send(function(err, tree) {
        data = tree;
        done();
      });

      xhr = FakeXhr.instances.pop();
      xhr.respond(xml, 207);
    });

    test('simple tree', function() {
      assert.ok(data['/calendar/user/']);
    });
  });

});

