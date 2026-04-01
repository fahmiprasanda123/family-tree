--
-- PostgreSQL database dump
--

\restrict mDxhE3UrYKJsGmdHenJdVkPlPcxrUCWIVXBzQDwTPQ0ImEpjcIcyz3HEOh3Jd9h

-- Dumped from database version 15.16
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: family_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_members (
    id uuid NOT NULL,
    full_name text NOT NULL,
    nickname text,
    gender text NOT NULL,
    birth_date timestamp with time zone,
    birth_place text,
    death_date timestamp with time zone,
    photo_url text,
    bio text,
    phone text,
    address text,
    occupation text,
    is_alive boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.family_members OWNER TO postgres;

--
-- Name: relationships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relationships (
    id uuid NOT NULL,
    parent_id uuid NOT NULL,
    child_id uuid NOT NULL,
    relationship_type text DEFAULT 'biological'::text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.relationships OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'member'::text,
    family_member_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: family_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_members (id, full_name, nickname, gender, birth_date, birth_place, death_date, photo_url, bio, phone, address, occupation, is_alive, created_by, created_at, updated_at, deleted_at) FROM stdin;
72fbf6e6-01cc-4237-b931-151e18e01067	Nasum Bin Asanwikarta	Nasum	male	1937-11-01 00:00:00+00	Kroya	1997-09-17 00:00:00+00	http://localhost:8080/uploads/1774186876071005780_WhatsApp_Image_2026-03-17_at_11.42.45.jpeg			Komplek Pertamina No 145 Cimanggis	Personalia	f	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 13:32:50.454523+00	2026-03-22 13:41:18.055135+00	\N
37f1a92a-f070-49ca-a8f9-d6c8249f587f	Wagiyah Binti Mangunkarso	Wagiyah	female	1939-01-01 00:00:00+00	Wonogiri	2022-12-23 00:00:00+00	http://localhost:8080/uploads/1774187146783754320_WhatsApp_Image_2026-03-22_at_20.45.30.jpeg			Komplek Pertamina no 145	Ibu Rumah Tangga	f	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 13:47:15.513683+00	2026-03-22 13:48:00.03147+00	\N
ee5e7e30-6416-44fe-b667-a22e5900e748	Nina Marsini	Nina	female	1969-02-02 00:00:00+00	Jakarta	\N	http://localhost:8080/uploads/1774188021637317896_WhatsApp_Image_2026-03-22_at_21.00.05.jpeg		081381631520	Permata Duta E3/06	Guru	t	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 14:01:02.790039+00	2026-03-22 14:01:02.790039+00	\N
5b990ad2-4d54-4a47-9ee3-157d09c9de63	Amin Nurdin	Amin	male	1964-10-02 00:00:00+00	Tangerang	2017-09-06 00:00:00+00	http://localhost:8080/uploads/1774188548689470442_WhatsApp_Image_2026-03-22_at_21.08.09.jpeg			Permata Duta E3/06	TNI	t	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 14:10:38.869753+00	2026-03-22 14:10:38.869753+00	\N
2bf2280c-a4fd-48b5-8f64-f032769a0583	Yoga Pratama	Yoga	male	1994-12-03 00:00:00+00	Tangerang	\N	http://localhost:8080/uploads/1774189039338192833_WhatsApp_Image_2026-03-22_at_21.15.14_(1).jpeg			Pasir Putih	Swasta	t	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 14:16:48.243142+00	2026-03-22 14:17:22.371781+00	\N
5fbf5443-658d-4f41-b5bb-316192e6e795	Nur Rahmi	Rahmi	male	1997-01-01 00:00:00+00	Jakarta	\N	http://localhost:8080/uploads/1774189165400847053_WhatsApp_Image_2026-03-22_at_21.15.14.jpeg			Pasir Putih	Swasta	t	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 14:19:59.085494+00	2026-03-22 14:19:59.085494+00	\N
1414f99e-049b-49fe-82d6-49641d84a7d1	Zayyan	Zayyan	male	2022-01-01 00:00:00+00	Depok	\N	http://localhost:8080/uploads/1774189250435295803_WhatsApp_Image_2026-03-22_at_21.15.13.jpeg					t	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 14:21:20.301777+00	2026-03-22 14:21:20.301777+00	\N
5b9e5765-737c-4996-8c3e-400e6d7214c5	Fahmi Prasanda	Fahmi	male	1998-06-17 00:00:00+00	Tangerang	\N	http://localhost:8080/uploads/1774189329109995511_WhatsApp_Image_2026-03-22_at_21.15.59.jpeg				Swasta	t	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 14:22:30.1494+00	2026-03-22 14:22:30.1494+00	\N
51e75415-909c-466c-9f09-7535eb3cbb3f	Marsidi	Marsidi	male	1939-01-01 00:00:00+00	Serang	2004-01-01 00:00:00+00	http://localhost:8080/uploads/1774223619470801965_WhatsApp_Image_2026-03-23_at_06.52.40.jpeg				Guru	t	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 23:54:21.997184+00	2026-03-22 23:54:21.997184+00	\N
54a189c8-7d1c-4607-b214-af459404eeaa	Asmariah	Asmariah	female	1939-01-01 00:00:00+00	Serang	2010-01-01 00:00:00+00	http://localhost:8080/uploads/1774223678115215339_WhatsApp_Image_2026-03-23_at_06.52.40.jpeg				Ibu Rumah Tangga	t	a433b1fd-1b32-455c-bc57-34b702e9b61e	2026-03-22 23:55:39.05887+00	2026-03-22 23:55:39.05887+00	\N
550c5711-ee2b-4bf5-a670-f601e7426ab0	Srikandi Larasati	Sri	female	1950-01-01 00:00:00+00	jakarta	2010-01-01 00:00:00+00					PNS	t	517aa8af-e417-451c-b07c-1f49581c3162	2026-03-23 01:46:43.672859+00	2026-03-23 01:46:43.672859+00	\N
53558711-603a-46c4-99ab-56dfecc7605c	Gatot Supriyadi	Gatot	male	1951-01-01 00:00:00+00	jakarta	2025-12-12 00:00:00+00						t	6c1e9a9e-a323-4060-b40a-0547854cc277	2026-03-23 01:49:34.541898+00	2026-03-23 01:49:34.541898+00	\N
\.


--
-- Data for Name: relationships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relationships (id, parent_id, child_id, relationship_type, created_at, updated_at) FROM stdin;
14df9b08-04ff-46e1-a551-ebd372aceeeb	72fbf6e6-01cc-4237-b931-151e18e01067	37f1a92a-f070-49ca-a8f9-d6c8249f587f	spouse	2026-03-23 00:27:11.2998+00	2026-03-23 00:27:11.2998+00
130a100a-53d9-4707-b36e-66e1b90683f5	51e75415-909c-466c-9f09-7535eb3cbb3f	54a189c8-7d1c-4607-b214-af459404eeaa	spouse	2026-03-23 00:27:11.316906+00	2026-03-23 00:27:11.316906+00
8e5a7c7f-bb41-412c-a62f-8bf66b0f9c21	5b990ad2-4d54-4a47-9ee3-157d09c9de63	ee5e7e30-6416-44fe-b667-a22e5900e748	spouse	2026-03-23 00:27:11.320157+00	2026-03-23 00:27:11.320157+00
260f95a9-f830-42fd-b2eb-6b1579c4966e	2bf2280c-a4fd-48b5-8f64-f032769a0583	5fbf5443-658d-4f41-b5bb-316192e6e795	spouse	2026-03-23 00:27:11.323157+00	2026-03-23 00:27:11.323157+00
88ce4c85-597a-4a67-af98-4d3765c91f0b	51e75415-909c-466c-9f09-7535eb3cbb3f	5b990ad2-4d54-4a47-9ee3-157d09c9de63	biological	2026-03-23 00:27:11.32661+00	2026-03-23 00:27:11.32661+00
018b3c83-115a-407f-95f8-de9e08f20537	54a189c8-7d1c-4607-b214-af459404eeaa	5b990ad2-4d54-4a47-9ee3-157d09c9de63	biological	2026-03-23 00:27:11.331202+00	2026-03-23 00:27:11.331202+00
41053c77-52c8-4f27-9ab2-740a29e42ebf	72fbf6e6-01cc-4237-b931-151e18e01067	ee5e7e30-6416-44fe-b667-a22e5900e748	biological	2026-03-23 00:27:11.334481+00	2026-03-23 00:27:11.334481+00
be66ec6e-9930-4f4e-8246-778ef9e2342a	37f1a92a-f070-49ca-a8f9-d6c8249f587f	ee5e7e30-6416-44fe-b667-a22e5900e748	biological	2026-03-23 00:27:11.337068+00	2026-03-23 00:27:11.337068+00
a79b6d42-6945-437e-b8d6-c289160ef3ef	5b990ad2-4d54-4a47-9ee3-157d09c9de63	2bf2280c-a4fd-48b5-8f64-f032769a0583	biological	2026-03-23 00:27:11.339804+00	2026-03-23 00:27:11.339804+00
7af2a858-76c9-48f7-9491-b232195f7aff	ee5e7e30-6416-44fe-b667-a22e5900e748	2bf2280c-a4fd-48b5-8f64-f032769a0583	biological	2026-03-23 00:27:11.342663+00	2026-03-23 00:27:11.342663+00
081ee538-9aa6-4e14-b7f9-1d701cf713ad	5b990ad2-4d54-4a47-9ee3-157d09c9de63	5b9e5765-737c-4996-8c3e-400e6d7214c5	biological	2026-03-23 00:27:11.346285+00	2026-03-23 00:27:11.346285+00
1d7b675b-1353-477f-863a-d9496be9378b	ee5e7e30-6416-44fe-b667-a22e5900e748	5b9e5765-737c-4996-8c3e-400e6d7214c5	biological	2026-03-23 00:27:11.34986+00	2026-03-23 00:27:11.34986+00
b0571b50-44d1-469c-a768-72e1672c6cb5	2bf2280c-a4fd-48b5-8f64-f032769a0583	1414f99e-049b-49fe-82d6-49641d84a7d1	biological	2026-03-23 00:27:11.353001+00	2026-03-23 00:27:11.353001+00
667f6ae1-8e52-48bc-927f-63eed6b8ac11	5fbf5443-658d-4f41-b5bb-316192e6e795	1414f99e-049b-49fe-82d6-49641d84a7d1	biological	2026-03-23 00:27:11.3563+00	2026-03-23 00:27:11.3563+00
2e926204-3a54-4f89-b8c4-3181ced03b7f	72fbf6e6-01cc-4237-b931-151e18e01067	550c5711-ee2b-4bf5-a670-f601e7426ab0	biological	2026-03-23 01:47:48.28438+00	2026-03-23 01:47:48.28438+00
107d121e-84b2-4d63-b905-64457718aca1	37f1a92a-f070-49ca-a8f9-d6c8249f587f	550c5711-ee2b-4bf5-a670-f601e7426ab0	biological	2026-03-23 01:48:04.201142+00	2026-03-23 01:48:04.201142+00
19f123ed-34c8-43e0-8f9e-2410d4bf8870	72fbf6e6-01cc-4237-b931-151e18e01067	53558711-603a-46c4-99ab-56dfecc7605c	biological	2026-03-23 01:55:44.902726+00	2026-03-23 01:55:44.902726+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, family_member_id, created_at, updated_at, deleted_at) FROM stdin;
a433b1fd-1b32-455c-bc57-34b702e9b61e	Fahmi Prasanda	me@fahmiprasanda.com	$2a$10$MQvQYy3vs/JePV7hJ3hsOOR1UHeg2/r57AXiE6VHlL55KqAVgXGCO	admin	\N	2026-03-22 13:31:19.239119+00	2026-03-22 13:31:19.239119+00	\N
517aa8af-e417-451c-b07c-1f49581c3162	Srikandi Larasati	srikandi@nasum.as	$2a$10$IywUNimZKIfsK78xKYqGJOyJpUO2fjEwm/HXLvy56z5t6nC4xm1ii	member	\N	2026-03-23 01:45:54.672904+00	2026-03-23 01:45:54.672904+00	\N
6c1e9a9e-a323-4060-b40a-0547854cc277	Gatot Supriyadi	gatot@nasum.as	$2a$10$b3p7vKe3xWDjyq1GbDN/xuOF7YGp/MTasdm3X4F3itzNG/iCBtGwG	member	\N	2026-03-23 01:48:47.944901+00	2026-03-23 01:48:47.944901+00	\N
\.


--
-- Name: family_members family_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_pkey PRIMARY KEY (id);


--
-- Name: relationships relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT relationships_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_family_members_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_family_members_deleted_at ON public.family_members USING btree (deleted_at);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_deleted_at ON public.users USING btree (deleted_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: relationships fk_family_members_children; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT fk_family_members_children FOREIGN KEY (parent_id) REFERENCES public.family_members(id);


--
-- Name: relationships fk_family_members_parents; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT fk_family_members_parents FOREIGN KEY (child_id) REFERENCES public.family_members(id);


--
-- Name: users fk_users_family_member; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_family_member FOREIGN KEY (family_member_id) REFERENCES public.family_members(id);


--
-- PostgreSQL database dump complete
--

\unrestrict mDxhE3UrYKJsGmdHenJdVkPlPcxrUCWIVXBzQDwTPQ0ImEpjcIcyz3HEOh3Jd9h

