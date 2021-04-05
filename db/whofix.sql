--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2 (Debian 13.2-1.pgdg100+1)
-- Dumped by pg_dump version 13.2 (Debian 13.2-1.pgdg100+1)

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

--
-- Name: whofix; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE whofix WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C.UTF-8';


ALTER DATABASE whofix OWNER TO postgres;

\connect whofix

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

--
-- Name: mod_enums; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA mod_enums;


ALTER SCHEMA mod_enums OWNER TO postgres;

--
-- Name: mod_security; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA mod_security;


ALTER SCHEMA mod_security OWNER TO postgres;

--
-- Name: mod_users; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA mod_users;


ALTER SCHEMA mod_users OWNER TO postgres;

--
-- Name: SCHEMA mod_users; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA mod_users IS 'mod_schemas';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: countries; Type: TABLE; Schema: mod_enums; Owner: postgres
--

CREATE TABLE mod_enums.countries (
    id integer NOT NULL,
    name character varying NOT NULL,
    short_name character varying,
    geom public.geometry(MultiPolygon,4326)
);


ALTER TABLE mod_enums.countries OWNER TO postgres;

--
-- Name: countries_id_seq; Type: SEQUENCE; Schema: mod_enums; Owner: postgres
--

CREATE SEQUENCE mod_enums.countries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE mod_enums.countries_id_seq OWNER TO postgres;

--
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: mod_enums; Owner: postgres
--

ALTER SEQUENCE mod_enums.countries_id_seq OWNED BY mod_enums.countries.id;


--
-- Name: municipalities; Type: TABLE; Schema: mod_enums; Owner: postgres
--

CREATE TABLE mod_enums.municipalities (
    id integer NOT NULL,
    name character varying NOT NULL,
    short_name character varying,
    code character varying,
    geom public.geometry(MultiPolygon,4326),
    municipality integer
);


ALTER TABLE mod_enums.municipalities OWNER TO postgres;

--
-- Name: municipalities_id_seq; Type: SEQUENCE; Schema: mod_enums; Owner: postgres
--

CREATE SEQUENCE mod_enums.municipalities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE mod_enums.municipalities_id_seq OWNER TO postgres;

--
-- Name: municipalities_id_seq; Type: SEQUENCE OWNED BY; Schema: mod_enums; Owner: postgres
--

ALTER SEQUENCE mod_enums.municipalities_id_seq OWNED BY mod_enums.municipalities.id;


--
-- Name: provinces; Type: TABLE; Schema: mod_enums; Owner: postgres
--

CREATE TABLE mod_enums.provinces (
    id integer NOT NULL,
    name character varying NOT NULL,
    short_name character varying,
    code character varying,
    geom public.geometry(MultiPolygon,4326),
    province integer
);


ALTER TABLE mod_enums.provinces OWNER TO postgres;

--
-- Name: provinces_id_seq; Type: SEQUENCE; Schema: mod_enums; Owner: postgres
--

CREATE SEQUENCE mod_enums.provinces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE mod_enums.provinces_id_seq OWNER TO postgres;

--
-- Name: provinces_id_seq; Type: SEQUENCE OWNED BY; Schema: mod_enums; Owner: postgres
--

ALTER SEQUENCE mod_enums.provinces_id_seq OWNED BY mod_enums.provinces.id;


--
-- Name: functionalities; Type: TABLE; Schema: mod_security; Owner: postgres
--

CREATE TABLE mod_security.functionalities (
    name character varying NOT NULL,
    description character varying,
    root_only boolean DEFAULT false NOT NULL,
    id character varying NOT NULL
);


ALTER TABLE mod_security.functionalities OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: mod_security; Owner: postgres
--

CREATE TABLE mod_security.roles (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    root boolean DEFAULT false NOT NULL
);


ALTER TABLE mod_security.roles OWNER TO postgres;

--
-- Name: roles_functionalities_functionalities; Type: TABLE; Schema: mod_security; Owner: postgres
--

CREATE TABLE mod_security.roles_functionalities_functionalities (
    "rolesId" integer NOT NULL,
    "functionalitiesId" character varying NOT NULL
);


ALTER TABLE mod_security.roles_functionalities_functionalities OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: mod_security; Owner: postgres
--

CREATE SEQUENCE mod_security.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE mod_security.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: mod_security; Owner: postgres
--

ALTER SEQUENCE mod_security.roles_id_seq OWNED BY mod_security.roles.id;


--
-- Name: users; Type: TABLE; Schema: mod_security; Owner: postgres
--

CREATE TABLE mod_security.users (
    id integer NOT NULL,
    name character varying,
    lastname character varying,
    username character varying NOT NULL,
    email character varying,
    phone_number character varying,
    telegram_id character varying,
    active boolean DEFAULT true NOT NULL,
    expiration_date timestamp without time zone,
    agent_info integer
);


ALTER TABLE mod_security.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: mod_security; Owner: postgres
--

CREATE SEQUENCE mod_security.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE mod_security.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: mod_security; Owner: postgres
--

ALTER SEQUENCE mod_security.users_id_seq OWNED BY mod_security.users.id;


--
-- Name: agents; Type: TABLE; Schema: mod_users; Owner: postgres
--

CREATE TABLE mod_users.agents (
    "user" integer NOT NULL,
    role integer NOT NULL,
    expiration_date timestamp without time zone,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE mod_users.agents OWNER TO postgres;

--
-- Name: techniccians; Type: TABLE; Schema: mod_users; Owner: postgres
--

CREATE TABLE mod_users.techniccians (
    "user" integer NOT NULL
);


ALTER TABLE mod_users.techniccians OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: mod_users; Owner: postgres
--

CREATE TABLE mod_users.users (
    id integer NOT NULL,
    name character varying,
    lastname character varying,
    username character varying NOT NULL,
    email character varying,
    phone_number character varying,
    telegram_id character varying,
    active boolean DEFAULT true NOT NULL,
    expiration_date timestamp without time zone,
    photo character varying,
    password character varying NOT NULL,
    salt character varying NOT NULL
);


ALTER TABLE mod_users.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: mod_users; Owner: postgres
--

CREATE SEQUENCE mod_users.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE mod_users.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: mod_users; Owner: postgres
--

ALTER SEQUENCE mod_users.users_id_seq OWNED BY mod_users.users.id;


--
-- Name: agents_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_entity (
    "user" integer NOT NULL,
    role integer NOT NULL
);


ALTER TABLE public.agents_entity OWNER TO postgres;

--
-- Name: countries_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries_entity (
    id integer NOT NULL,
    name character varying NOT NULL,
    short_name character varying,
    geom public.geometry(MultiPolygon,4326)
);


ALTER TABLE public.countries_entity OWNER TO postgres;

--
-- Name: countries_entity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.countries_entity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.countries_entity_id_seq OWNER TO postgres;

--
-- Name: countries_entity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.countries_entity_id_seq OWNED BY public.countries_entity.id;


--
-- Name: municialities_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.municialities_entity (
    id integer NOT NULL,
    name character varying NOT NULL,
    short_name character varying,
    code character varying,
    geom public.geometry(MultiPolygon,4326),
    municipality integer
);


ALTER TABLE public.municialities_entity OWNER TO postgres;

--
-- Name: municialities_entity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.municialities_entity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.municialities_entity_id_seq OWNER TO postgres;

--
-- Name: municialities_entity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.municialities_entity_id_seq OWNED BY public.municialities_entity.id;


--
-- Name: provinces_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provinces_entity (
    id integer NOT NULL,
    name character varying NOT NULL,
    short_name character varying,
    code character varying,
    geom public.geometry(MultiPolygon,4326),
    province integer
);


ALTER TABLE public.provinces_entity OWNER TO postgres;

--
-- Name: provinces_entity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.provinces_entity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.provinces_entity_id_seq OWNER TO postgres;

--
-- Name: provinces_entity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.provinces_entity_id_seq OWNED BY public.provinces_entity.id;


--
-- Name: techniccian_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.techniccian_entity (
    "user" integer NOT NULL
);


ALTER TABLE public.techniccian_entity OWNER TO postgres;

--
-- Name: user_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_entity (
    id integer NOT NULL,
    name character varying,
    lastname character varying,
    username character varying NOT NULL
);


ALTER TABLE public.user_entity OWNER TO postgres;

--
-- Name: user_entity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_entity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_entity_id_seq OWNER TO postgres;

--
-- Name: user_entity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_entity_id_seq OWNED BY public.user_entity.id;


--
-- Name: countries id; Type: DEFAULT; Schema: mod_enums; Owner: postgres
--

ALTER TABLE ONLY mod_enums.countries ALTER COLUMN id SET DEFAULT nextval('mod_enums.countries_id_seq'::regclass);


--
-- Name: municipalities id; Type: DEFAULT; Schema: mod_enums; Owner: postgres
--

ALTER TABLE ONLY mod_enums.municipalities ALTER COLUMN id SET DEFAULT nextval('mod_enums.municipalities_id_seq'::regclass);


--
-- Name: provinces id; Type: DEFAULT; Schema: mod_enums; Owner: postgres
--

ALTER TABLE ONLY mod_enums.provinces ALTER COLUMN id SET DEFAULT nextval('mod_enums.provinces_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.roles ALTER COLUMN id SET DEFAULT nextval('mod_security.roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.users ALTER COLUMN id SET DEFAULT nextval('mod_security.users_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.users ALTER COLUMN id SET DEFAULT nextval('mod_users.users_id_seq'::regclass);


--
-- Name: countries_entity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries_entity ALTER COLUMN id SET DEFAULT nextval('public.countries_entity_id_seq'::regclass);


--
-- Name: municialities_entity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municialities_entity ALTER COLUMN id SET DEFAULT nextval('public.municialities_entity_id_seq'::regclass);


--
-- Name: provinces_entity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces_entity ALTER COLUMN id SET DEFAULT nextval('public.provinces_entity_id_seq'::regclass);


--
-- Name: user_entity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity ALTER COLUMN id SET DEFAULT nextval('public.user_entity_id_seq'::regclass);


--
-- Data for Name: countries; Type: TABLE DATA; Schema: mod_enums; Owner: postgres
--



--
-- Data for Name: municipalities; Type: TABLE DATA; Schema: mod_enums; Owner: postgres
--



--
-- Data for Name: provinces; Type: TABLE DATA; Schema: mod_enums; Owner: postgres
--



--
-- Data for Name: functionalities; Type: TABLE DATA; Schema: mod_security; Owner: postgres
--

INSERT INTO mod_security.functionalities VALUES ('Gestión de usuarios', NULL, false, 'manage_users');
INSERT INTO mod_security.functionalities VALUES ('Gestión de roles', NULL, false, 'manage_roles');
INSERT INTO mod_security.functionalities VALUES ('Gestión de competencias', NULL, false, 'manage_capabilities');
INSERT INTO mod_security.functionalities VALUES ('Gestión de grupos de competencias', NULL, false, 'manage_capabilities_groups');
INSERT INTO mod_security.functionalities VALUES ('Gestionar métodos de pago', NULL, false, 'manage_payment_method');
INSERT INTO mod_security.functionalities VALUES ('Gestionar tipos de solicitudes', NULL, false, 'manage_requests_types');
INSERT INTO mod_security.functionalities VALUES ('Gestionar métodos de retiro', NULL, false, 'manage_retirement_types');
INSERT INTO mod_security.functionalities VALUES ('Configurar portfolio', NULL, false, 'manage_portfolio');
INSERT INTO mod_security.functionalities VALUES ('Gestionar altas vacantes', NULL, false, 'manage_work_offers');
INSERT INTO mod_security.functionalities VALUES ('Atender solicitudes de empleo', NULL, false, 'manage_works_requests');
INSERT INTO mod_security.functionalities VALUES ('Gestión de denuncias, reportes y sugerencias', NULL, false, 'manage_issues');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: mod_security; Owner: postgres
--

INSERT INTO mod_security.roles VALUES (1, 'Administrador', 'Administrador general del sistema, tiene acceso a todas las funcionalidades', true);


--
-- Data for Name: roles_functionalities_functionalities; Type: TABLE DATA; Schema: mod_security; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: mod_security; Owner: postgres
--



--
-- Data for Name: agents; Type: TABLE DATA; Schema: mod_users; Owner: postgres
--

INSERT INTO mod_users.agents VALUES (1, 1, NULL, true);
INSERT INTO mod_users.agents VALUES (4, 1, '2020-01-01 00:00:00', false);


--
-- Data for Name: techniccians; Type: TABLE DATA; Schema: mod_users; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: mod_users; Owner: postgres
--

INSERT INTO mod_users.users VALUES (1, 'Juan Pablo', 'Bacallao Castillo', 'john', NULL, NULL, NULL, true, NULL, NULL, '$2a$10$7Vu1WmFaO2z2sDa1ImixD.kNn4iwMqPXuUxxmIfp30gQERXIRSZhG', '$2a$10$7Vu1WmFaO2z2sDa1ImixD.');
INSERT INTO mod_users.users VALUES (4, 'Wendy', 'Torres', 'wendy', NULL, NULL, NULL, true, NULL, NULL, '$2a$10$mIUODWaO6fWF3orHY9qUc.84yaRdmW7c8opaUiqqiCP2mkzWcl8j2', '$2a$10$mIUODWaO6fWF3orHY9qUc.');


--
-- Data for Name: agents_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: countries_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: municialities_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: provinces_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: techniccian_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: mod_enums; Owner: postgres
--

SELECT pg_catalog.setval('mod_enums.countries_id_seq', 1, false);


--
-- Name: municipalities_id_seq; Type: SEQUENCE SET; Schema: mod_enums; Owner: postgres
--

SELECT pg_catalog.setval('mod_enums.municipalities_id_seq', 1, false);


--
-- Name: provinces_id_seq; Type: SEQUENCE SET; Schema: mod_enums; Owner: postgres
--

SELECT pg_catalog.setval('mod_enums.provinces_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: mod_security; Owner: postgres
--

SELECT pg_catalog.setval('mod_security.roles_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: mod_security; Owner: postgres
--

SELECT pg_catalog.setval('mod_security.users_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: mod_users; Owner: postgres
--

SELECT pg_catalog.setval('mod_users.users_id_seq', 4, true);


--
-- Name: countries_entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.countries_entity_id_seq', 1, false);


--
-- Name: municialities_entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.municialities_entity_id_seq', 1, false);


--
-- Name: provinces_entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.provinces_entity_id_seq', 1, false);


--
-- Name: user_entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_entity_id_seq', 1, false);


--
-- Name: municipalities PK_186f177a6d620fb018d0ed23f2c; Type: CONSTRAINT; Schema: mod_enums; Owner: postgres
--

ALTER TABLE ONLY mod_enums.municipalities
    ADD CONSTRAINT "PK_186f177a6d620fb018d0ed23f2c" PRIMARY KEY (id);


--
-- Name: countries PK_86f216ab6cff589a6327b8ce0d8; Type: CONSTRAINT; Schema: mod_enums; Owner: postgres
--

ALTER TABLE ONLY mod_enums.countries
    ADD CONSTRAINT "PK_86f216ab6cff589a6327b8ce0d8" PRIMARY KEY (id);


--
-- Name: provinces PK_9dc3232db1a22f75f70eef23b09; Type: CONSTRAINT; Schema: mod_enums; Owner: postgres
--

ALTER TABLE ONLY mod_enums.provinces
    ADD CONSTRAINT "PK_9dc3232db1a22f75f70eef23b09" PRIMARY KEY (id);


--
-- Name: functionalities PK_0e2b26ccba7a862658520df3d43; Type: CONSTRAINT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.functionalities
    ADD CONSTRAINT "PK_0e2b26ccba7a862658520df3d43" PRIMARY KEY (id);


--
-- Name: users PK_24cecfb24b25c7bc93d6c0c962d; Type: CONSTRAINT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.users
    ADD CONSTRAINT "PK_24cecfb24b25c7bc93d6c0c962d" PRIMARY KEY (id);


--
-- Name: roles_functionalities_functionalities PK_831e2c78c1b03dc170f6be09c4e; Type: CONSTRAINT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.roles_functionalities_functionalities
    ADD CONSTRAINT "PK_831e2c78c1b03dc170f6be09c4e" PRIMARY KEY ("rolesId", "functionalitiesId");


--
-- Name: roles PK_f7c8b3c8755ee84e29d01e6fac4; Type: CONSTRAINT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.roles
    ADD CONSTRAINT "PK_f7c8b3c8755ee84e29d01e6fac4" PRIMARY KEY (id);


--
-- Name: users UQ_d5590eba68e31d41662baa7de96; Type: CONSTRAINT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.users
    ADD CONSTRAINT "UQ_d5590eba68e31d41662baa7de96" UNIQUE (agent_info);


--
-- Name: techniccians PK_5ed4591e130a46294a8661f218e; Type: CONSTRAINT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.techniccians
    ADD CONSTRAINT "PK_5ed4591e130a46294a8661f218e" PRIMARY KEY ("user");


--
-- Name: agents PK_a398905df40c7334f076cf288db; Type: CONSTRAINT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.agents
    ADD CONSTRAINT "PK_a398905df40c7334f076cf288db" PRIMARY KEY ("user");


--
-- Name: users PK_afb1130c8004085c4f5096f3dc4; Type: CONSTRAINT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.users
    ADD CONSTRAINT "PK_afb1130c8004085c4f5096f3dc4" PRIMARY KEY (id);


--
-- Name: techniccians UQ_5ed4591e130a46294a8661f218e; Type: CONSTRAINT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.techniccians
    ADD CONSTRAINT "UQ_5ed4591e130a46294a8661f218e" UNIQUE ("user");


--
-- Name: agents UQ_a398905df40c7334f076cf288db; Type: CONSTRAINT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.agents
    ADD CONSTRAINT "UQ_a398905df40c7334f076cf288db" UNIQUE ("user");


--
-- Name: municialities_entity PK_2002c6fbc6186ec8fbca0f6580d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municialities_entity
    ADD CONSTRAINT "PK_2002c6fbc6186ec8fbca0f6580d" PRIMARY KEY (id);


--
-- Name: provinces_entity PK_639e43d290206b7be59d7ee4302; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces_entity
    ADD CONSTRAINT "PK_639e43d290206b7be59d7ee4302" PRIMARY KEY (id);


--
-- Name: user_entity PK_b54f8ea623b17094db7667d8206; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY (id);


--
-- Name: agents_entity PK_ba73c45c30c89aeb2235433f33d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_entity
    ADD CONSTRAINT "PK_ba73c45c30c89aeb2235433f33d" PRIMARY KEY ("user");


--
-- Name: countries_entity PK_c5263e4cb1bdaa2b354f0144160; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries_entity
    ADD CONSTRAINT "PK_c5263e4cb1bdaa2b354f0144160" PRIMARY KEY (id);


--
-- Name: techniccian_entity PK_f589b819a5aacf76919267855f1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.techniccian_entity
    ADD CONSTRAINT "PK_f589b819a5aacf76919267855f1" PRIMARY KEY ("user");


--
-- Name: agents_entity UQ_ba73c45c30c89aeb2235433f33d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_entity
    ADD CONSTRAINT "UQ_ba73c45c30c89aeb2235433f33d" UNIQUE ("user");


--
-- Name: IDX_8a505ff51770f975cc445d971c; Type: INDEX; Schema: mod_enums; Owner: postgres
--

CREATE INDEX "IDX_8a505ff51770f975cc445d971c" ON mod_enums.provinces USING btree (geom);


--
-- Name: IDX_d41cfbc96dfe46e55439714a0a; Type: INDEX; Schema: mod_enums; Owner: postgres
--

CREATE INDEX "IDX_d41cfbc96dfe46e55439714a0a" ON mod_enums.municipalities USING btree (geom);


--
-- Name: IDX_3b5bc38bf7b515b634e628f340; Type: INDEX; Schema: mod_security; Owner: postgres
--

CREATE INDEX "IDX_3b5bc38bf7b515b634e628f340" ON mod_security.roles_functionalities_functionalities USING btree ("rolesId");


--
-- Name: IDX_64ec74d11b8eca0e77e417bda7; Type: INDEX; Schema: mod_security; Owner: postgres
--

CREATE INDEX "IDX_64ec74d11b8eca0e77e417bda7" ON mod_security.roles_functionalities_functionalities USING btree ("functionalitiesId");


--
-- Name: IDX_07c56961702411cd4703ac081d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_07c56961702411cd4703ac081d" ON public.provinces_entity USING btree (geom);


--
-- Name: IDX_c806235dbc9cb827239a568b24; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c806235dbc9cb827239a568b24" ON public.municialities_entity USING btree (geom);


--
-- Name: municipalities FK_9a72ca9b21e37f2128b82998e45; Type: FK CONSTRAINT; Schema: mod_enums; Owner: postgres
--

ALTER TABLE ONLY mod_enums.municipalities
    ADD CONSTRAINT "FK_9a72ca9b21e37f2128b82998e45" FOREIGN KEY (municipality) REFERENCES mod_enums.municipalities(id);


--
-- Name: provinces FK_dbdba1b67641b097aab4b5b972b; Type: FK CONSTRAINT; Schema: mod_enums; Owner: postgres
--

ALTER TABLE ONLY mod_enums.provinces
    ADD CONSTRAINT "FK_dbdba1b67641b097aab4b5b972b" FOREIGN KEY (province) REFERENCES mod_enums.provinces(id);


--
-- Name: roles_functionalities_functionalities FK_3b5bc38bf7b515b634e628f340c; Type: FK CONSTRAINT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.roles_functionalities_functionalities
    ADD CONSTRAINT "FK_3b5bc38bf7b515b634e628f340c" FOREIGN KEY ("rolesId") REFERENCES mod_security.roles(id) ON DELETE CASCADE;


--
-- Name: roles_functionalities_functionalities FK_64ec74d11b8eca0e77e417bda7b; Type: FK CONSTRAINT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.roles_functionalities_functionalities
    ADD CONSTRAINT "FK_64ec74d11b8eca0e77e417bda7b" FOREIGN KEY ("functionalitiesId") REFERENCES mod_security.functionalities(id) ON DELETE CASCADE;


--
-- Name: users FK_d5590eba68e31d41662baa7de96; Type: FK CONSTRAINT; Schema: mod_security; Owner: postgres
--

ALTER TABLE ONLY mod_security.users
    ADD CONSTRAINT "FK_d5590eba68e31d41662baa7de96" FOREIGN KEY (agent_info) REFERENCES public.agents_entity("user");


--
-- Name: techniccians FK_5ed4591e130a46294a8661f218e; Type: FK CONSTRAINT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.techniccians
    ADD CONSTRAINT "FK_5ed4591e130a46294a8661f218e" FOREIGN KEY ("user") REFERENCES mod_users.users(id);


--
-- Name: agents FK_a398905df40c7334f076cf288db; Type: FK CONSTRAINT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.agents
    ADD CONSTRAINT "FK_a398905df40c7334f076cf288db" FOREIGN KEY ("user") REFERENCES mod_users.users(id);


--
-- Name: agents FK_de7f65fc4dfa312d99bf93bec39; Type: FK CONSTRAINT; Schema: mod_users; Owner: postgres
--

ALTER TABLE ONLY mod_users.agents
    ADD CONSTRAINT "FK_de7f65fc4dfa312d99bf93bec39" FOREIGN KEY (role) REFERENCES mod_security.roles(id);


--
-- Name: provinces_entity FK_0733090a357802c773a5bf2535a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces_entity
    ADD CONSTRAINT "FK_0733090a357802c773a5bf2535a" FOREIGN KEY (province) REFERENCES public.provinces_entity(id);


--
-- Name: agents_entity FK_7721bfd58ed79a6017a32f11fa6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_entity
    ADD CONSTRAINT "FK_7721bfd58ed79a6017a32f11fa6" FOREIGN KEY (role) REFERENCES mod_security.roles(id);


--
-- Name: municialities_entity FK_8da2c54691d555b66cdc36df4d4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municialities_entity
    ADD CONSTRAINT "FK_8da2c54691d555b66cdc36df4d4" FOREIGN KEY (municipality) REFERENCES public.municialities_entity(id);


--
-- Name: agents_entity FK_ba73c45c30c89aeb2235433f33d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_entity
    ADD CONSTRAINT "FK_ba73c45c30c89aeb2235433f33d" FOREIGN KEY ("user") REFERENCES mod_security.users(id);


--
-- Name: techniccian_entity FK_f589b819a5aacf76919267855f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.techniccian_entity
    ADD CONSTRAINT "FK_f589b819a5aacf76919267855f1" FOREIGN KEY ("user") REFERENCES mod_security.users(id);


--
-- PostgreSQL database dump complete
--

