import { json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getContact, updateContact } from "../data";

import type { FunctionComponent } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { ContactRecord } from "../data";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId parameter");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response(`No contact found for ${params.contactId}`, { status: 404 });
  }
  
  return json({ contact });
};

export const action = async ({params, request}: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId parameter");
  const formData = await request.formData();
  return updateContact(params.contactId, {favourite: formData.get("favourite") === "true",});
};

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>();
  
  return (
    <div id="contact">
      <div>
        <img 
          src={contact.avatar} 
          key={contact.avatar}
          alt={`${contact.first} ${contact.last} avatar`}
        />
      </div>
      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}  
            </>
          ) : (
              <i>No name</i>
          )}{" "}
          <Favourite contact={{ favourite: contact.favourite }} />
        </h1>
        {contact.x ? (
          <p>
            <a href={`https://x.com/${contact.x}`}>
              {contact.x}
            </a>
          </p>
        ) : null}
        {contact.notes ? <p>{contact.notes}</p> : null}
        <div>
          <Form action="edit">
              <button type="submit">Edit</button>
          </Form>
          <Form 
              action="destroy"
              method="post"
              onSubmit={(event) => {
                const response = confirm("Are you sure you want to delete this record?");
                if (!response) {
                  event.preventDefault();
                }
              }}
          >
              <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favourite: FunctionComponent<{contact: Pick<ContactRecord, "favourite">;}> = ({contact}) => {
    const fetcher = useFetcher();
    const favourite = contact.favourite;

    return(
        <fetcher.Form method="post">
            <button
              aria-label={
                favourite? "Remove from favourites" : "Add to favourites"
              }
              name="favourite"
              value={favourite? "false" : "true"}
            >
              {favourite? "★" : "☆"}
            </button>
        </fetcher.Form>
    );
};
