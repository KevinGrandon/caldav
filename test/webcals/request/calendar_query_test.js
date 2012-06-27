requireRequest();
requireLib('request/propfind');
requireLib('request/calendar_query');

suite('webcals/request/calendar_query', function() {
  var Propfind,
      FakeXhr,
      CalendarData,
      CalendarQuery,
      CalendarFilter,
      Xhr,
      Template,
      oldXhrClass,
      SaxResponse;

  var url = 'http://google.com',
      subject;

  suiteSetup(function() {
    Propfind = Webcals.require('request/propfind');
    CalendarData = Webcals.require('templates/calendar_data');
    CalendarFilter = Webcals.require('templates/calendar_filter');
    CalendarQuery = Webcals.require('request/calendar_query');
    SaxResponse = Webcals.require('sax/dav_response');
    FakeXhr = Webcals.require('support/fake_xhr');
    Template = Webcals.require('template');
    Xhr = Webcals.require('xhr');

    oldXhrClass = Xhr.prototype.xhrClass;
    Xhr.prototype.xhrClass = FakeXhr;
  });

  suiteTeardown(function() {
    Xhr.prototype.xhrClass = oldXhrClass;
  });

  setup(function() {
    subject = new CalendarQuery(url);
    FakeXhr.instances.length = 0;
  });

  test('initializer', function() {
    assert.instanceOf(subject, Propfind);
    assert.deepEqual(subject._props, []);
    assert.equal(subject.xhr.headers['Depth'], 1);
    assert.equal(subject.xhr.method, 'REPORT');

    assert.instanceOf(subject.fields, CalendarData);
    assert.instanceOf(subject.filters, CalendarFilter);
  });

  test('#_createPayload', function() {
    subject.prop('getetag');
    subject.fields.select('VEVENT', ['NAME']);
    subject.filters.add('VEVENT', true);

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
    return;
    var xml,
        data,
        result,
        xhr,
        calledWith;

    defineSample('xml/propget.xml', function(data) {
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

