import Form from '../src/Form';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

let form;
let mockAdapter;

describe('Errors', () => {

    beforeEach(() => {
        form = new Form({
            field1: 'value 1',
            field2: 'value 2',
        });

        mockAdapter = new MockAdapter(axios);
    });

    it('exposes the passed form field values as properties', () => {
        expect(form.field1).toEqual('value 1');
        expect(form.field2).toEqual('value 2');
    });

    it('can reset the form values', () => {
        form.field1 = 'changed';
        form.field2 = 'changed';

        form.reset();

        expect(form.field1).toEqual('value 1');
        expect(form.field2).toEqual('value 2');
    });

    it('can use the current data as the new initial values', () => {
        form.setInitialValues({ field1: 'new initial' });

        form.reset();

        expect(form.field1).toBe('new initial');
    });


    it('can clear the form values', () => {
        form.clear();

        expect(form.field1).toEqual('');
        expect(form.field2).toEqual('');
    });

    it('will record the errors that the server passes through', async () => {
        mockAdapter.onPost('http://example.com/posts').reply(422, {
            'first_name': ['Value is required'],
        });

        try {
            await form.submit('post', 'http://example.com/posts');
        } catch (e) {} // eslint-disable-line no-empty

        expect(form.errors.has('first_name')).toBe(true);
    });

    it('can accept an array with form field names', () => {
        form = new Form(['field1', 'field2']);

        expect(form.data()['field1']).toEqual('');
        expect(form.data()['field2']).toEqual('');
    });

    it('resets the form on success unless the feature is disabled', async () => {
        mockAdapter.onPost('http://example.com/posts').reply(200, {});

        form = new Form({ field: 'value' });

        form.field = 'changed';

        await form.submit('post', 'http://example.com/posts');

        expect(form.field).toEqual('value');

        form = new Form({ field: 'value' }, { resetOnSuccess: false });

        form.field = 'changed';

        await form.submit('post', 'http://example.com/posts');

        expect(form.field).toEqual('changed');
    });

    it('can get an error message for a field', () => {
        expect(form.getError('field1')).toEqual(undefined);
    });

    it('can accept a custom http instance in options', () => {

        const http = axios.create({ baseURL: 'http://anotherexample.com' });

        mockAdapter = new MockAdapter(http);

        form = new Form({}, { http });

        expect(form.__http.defaults.baseURL).toBe('http://anotherexample.com');

        form = new Form({});

        expect(form.__http.defaults.baseURL).toBe(undefined);
    });

});
